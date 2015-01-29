import os
import get_weather as weather_services
from weather.forms import ForecastForm, RegistrationForm
from weather.models import PreviousForecastModel
from django.contrib import auth
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic.edit import FormView
from django.views.generic.base import TemplateView
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import Http404
import django.core.exceptions


REV_CHOICE_DAY = {'0': 'today', '1': 'tommorow', '2': 'day after tomorrow'}
REV_CHOICE_SERVICES = {'0': 'yahoo', '1': 'world weather online'}


class ForecastView(TemplateView):
    template_name = "weather/forecast_view.html"

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super(ForecastView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        try:
            db_forecast = PreviousForecastModel.objects.get(
                            id=int(kwargs['forecast_id']),
                            user_id=self.request.user.id)
        except django.core.exceptions.ObjectDoesNotExist:
            raise Http404
        prev_forecast = db_forecast.get_dict_data()
        try:
            if int(prev_forecast['services_name']):
                forecast_tomorrow = weather_services.check_world_weather_online(
                                                    prev_forecast['city'])
            else:
                forecast_tomorrow = weather_services.check_yahoo_weather(
                                            prev_forecast['city'])
        except weather_services.BaseWeatherException:
            db_forecast.delete()
            raise Http404

        context = super(ForecastView, self).get_context_data(**kwargs)
        context['location'] = forecast_tomorrow['location']
        context['weather'] = forecast_tomorrow['weather'] \
                             [prev_forecast['forecast_day']]
        return context


class ForecastParamView(FormView):
    template_name = 'weather/forecast_parameter.html'
    form_class = ForecastForm
    success_url = '/forecast'

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super(ForecastParamView, self).dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        input_form_data = form.cleaned_data
        input_form_data['user_id'] = self.request.user

        model = PreviousForecastModel()
        model.user_id = self.request.user
        model.city = input_form_data['city']
        model.forecast_day = input_form_data['forecast_day']
        model.services_name = input_form_data['services_name']
        model.save()

        self.success_url = os.path.join(self.success_url, str(model.id))
        result = super(ForecastParamView, self).form_valid(form)
        return result


class ErrorView(TemplateView):
    template_name = "error.html"

    def get_context_data(self, **kwargs):
        context = super(ErrorView, self).get_context_data(**kwargs)
        context['msg_error'] = "Oops... something wrong :)"
        return context


class LogInView(FormView):
    template_name = 'login.html'
    form_class = AuthenticationForm
    success_url = '/weather'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            result = HttpResponseRedirect(reverse("weather_page"))
        else:
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

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            result = HttpResponseRedirect(reverse("weather_page"))
        else:
            result = super(RegistrationView, self).dispatch(request, *args,
                                                            **kwargs)
        return  result

    def form_valid(self, form):
        data = form.save()
        input_registration_data = form.cleaned_data
        new_user = auth.authenticate(
                                username=input_registration_data['username'],
                                password=input_registration_data['password2'])
        if new_user:
            result = HttpResponseRedirect(reverse("log_in"))
        else:
            result = HttpResponseRedirect(reverse("error_page"))
        return result


class History(TemplateView):
    template_name = "weather/forecast_history.html"

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super(History, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(History, self).get_context_data(**kwargs)
        forecast_history = PreviousForecastModel.objects.all().filter(
                                                user_id=self.request.user.id)
        tabl_row = []
        for row in forecast_history:
            tmp = row.get_dict_data()
            tmp['services_name'] = REV_CHOICE_SERVICES[tmp['services_name']]
            tmp['forecast_day'] = REV_CHOICE_DAY[tmp['forecast_day']]
            tmp['url'] = (os.path.join(reverse("forecast_page"), str(row.id)))
            tabl_row.append(tmp)

        context['forecast_log'] = tabl_row
        return context
