import json
from django.contrib import auth
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic import DetailView, ListView

from django.views.generic.edit import FormView
from django.views.generic.base import TemplateView
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.decorators import method_decorator

from get_weather import GetWeather, BaseWeatherException
from weather.forms import ForecastForm, RegistrationForm
from weather.models import PreviousForecastModel
import weather.weather_site_errors as site_err


WeatherService = GetWeather()


def anon_user(user):
    return user.is_anonymous()


class ForecastView(DetailView):
    model = PreviousForecastModel
    pk_url_kwarg = 'forecast_id'
    slug_url_kwarg = 'id'

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        if not request.is_ajax():
            return HttpResponseRedirect(reverse("index"))
        return super(ForecastView, self).dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        try:
            result = super(ForecastView, self).get(request, *args, **kwargs)
        except site_err.BaseSiteException as error:
            out = dict(error_msg=error.message)
            return HttpResponse(json.dumps(out),
                                content_type="application/json")
        return result

    def get_context_data(self, **kwargs):
        if self.object.user_id != self.request.user.id:
            raise site_err.UserRightError("Sorry No right for this user")
        try:
            service_forecast = WeatherService.weather_by_service_name(
                self.object.services_name,
                self.object.city,
                self.object.forecast_day)
            out = dict(city=service_forecast.city,
                       country=service_forecast.country,
                       max_temperature=service_forecast.max_temperature,
                       min_temperature=service_forecast.min_temperature)
        except BaseWeatherException:
            self.object.delete()
            raise site_err.ExternalServicesError("City not found or server not "
                                                 "responding. Please try again")
        context = super(ForecastView, self).get_context_data(**kwargs)
        context['weather'] = out
        return context

    def render_to_response(self, context, **response_kwargs):
        return HttpResponse(json.dumps(context['weather']),
                            content_type="application/json")


class ForecastParamView(FormView):
    template_name = 'weather/forecast_parameter.html'
    form_class = ForecastForm

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        if not request.is_ajax():
            return HttpResponseRedirect(reverse("index"))
        return super(ForecastParamView, self).dispatch(request, *args, **kwargs)

    def form_invalid(self, form):
        err_list = []
        for field, val in form.errors.items():
            err_list.append(field.upper() + " - " + val)
        result = dict(error_msg=form.errors.items())
        result.update(dict(form_valid=0, error_msg=err_list))
        return HttpResponse(json.dumps(result), content_type="application/json")

    def form_valid(self, form):
        form.instance.user_id = self.request.user.id
        data = form.save()
        result = {'form_valid': 1, 'forecast_id': data.id}
        return HttpResponse(json.dumps(result), content_type="application/json")


class ErrorView(TemplateView):
    template_name = "error.html"

    def get_context_data(self, **kwargs):
        context = super(ErrorView, self).get_context_data(**kwargs)
        if "error_msg" in self.request.session:
            context['error_msg'] = self.request.session['error_msg']
        return context


class LogInView(FormView):
    template_name = 'login.html'
    form_class = AuthenticationForm
    success_url = '/index'

    @method_decorator(user_passes_test(anon_user, login_url="/index"))
    def dispatch(self, request, *args, **kwargs):
        if request.REQUEST.get('next'):
            self.success_url = request.REQUEST.get('next')
        result = super(LogInView, self).dispatch(request)
        return result

    def form_valid(self, form):
        input_login_data = form.cleaned_data
        user = auth.authenticate(username=input_login_data['username'],
                                 password=input_login_data['password'])
        if user:
            auth.login(self.request, user)
            result = super(LogInView, self).form_valid(form)
        else:
            result = HttpResponseRedirect(reverse("error_page"))
        return result


class RegistrationView(FormView):
    template_name = 'registration.html'
    form_class = RegistrationForm
    success_url = '/weather'

    @method_decorator(user_passes_test(anon_user, login_url="/index"))
    def dispatch(self, request, *args, **kwargs):
        result = super(RegistrationView, self).dispatch(request, *args,
                                                        **kwargs)
        return result

    def form_valid(self, form):
        form.save()
        input_registration_data = form.cleaned_data
        new_user = auth.authenticate(
            username=input_registration_data['username'],
            password=input_registration_data['password2'])
        if new_user:
            result = HttpResponseRedirect(reverse("log_in"))
        else:
            result = HttpResponseRedirect(reverse("error_page"))
        return result


class History(ListView):
    paginate_by = 10
    template_name = "weather/forecast_history.html"
    context_object_name = 'forecast_log'

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        if not request.is_ajax():
            return HttpResponseRedirect(reverse("index"))
        result = super(History, self).dispatch(request, *args, **kwargs)
        return result

    def get_queryset(self):
        requests_history = PreviousForecastModel.objects.filter(
            user_id=self.request.user.id)
        return requests_history.order_by('-id')

    def render_to_response(self, context, **response_kwargs):
        out = {}
        for number, val in enumerate(context['forecast_log']):
            out[str(number)] = dict(forecast_day=val.forecast_day, url=val.id,
                                    city=val.city,
                                    services_name=val.services_name)
        out = dict(history=out, paginator=dict(current=context[
            'page_obj'].number, maxpage=context['paginator'].num_pages))
        return HttpResponse(json.dumps(out), content_type="application/json")


class IndexPage(TemplateView):
    template_name = 'weather/forecast.html'

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super(IndexPage, self).dispatch(request, *args, **kwargs)
