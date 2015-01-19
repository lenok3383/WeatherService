import get_weather
from weather.forms import ForecastForm
from django.views.generic.edit import View, FormView
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.core.urlresolvers import reverse
from django.shortcuts import redirect


class ForecastView(TemplateView):
    def get(self, request):
        if request.session.has_key('tmp_data'):
            data = request.session['tmp_data']
            del request.session['tmp_data']
            return render(request, "weather/forecast_view.html", dict(location=data['title'], weather=data['weather']))
        else:
            return HttpResponseRedirect("/error/")


class ForecastParamView(FormView):
    template_name = 'weather/forecast_parameter.html'
    form_class = ForecastForm
    success_url = '/forecast/'

    def post(self, request):
        form = ForecastForm(request.POST)
        if form.is_valid():
            try:
                out = get_weather.check_yahoo_weather(form.cleaned_data['city'])
            except get_weather.BaseWeatherException as err:
                request.session['err_data'] = str(err.message)
                return HttpResponseRedirect("/error/")
            request.session['tmp_data'] = out
            return HttpResponseRedirect('/forecast/')
        else:
            return render(request, 'weather/forecast_parameter.html', {'form': form})

    def from_valid(self, form):
        return super(ForecastParamView, self).form_valid(form)


def my_error(request):
    if request.session.has_key('err_data'):
        err_value = request.session['err_data']
        del request.session['err_data']
        return render(request, "error.html", {'my_error': err_value})
    else:
        return render(request, "error.html", {'my_error': "Oops..."})

