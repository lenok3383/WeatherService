from django.shortcuts import render
from django.http import HttpResponse
from weather.forms import ForecastForm
from django.views.generic.edit import View, FormView
from get_weather import check_yahoo_weather, check_world_weather_online

class ForecastView(View):
    def get(self, request):
        return HttpResponse('get request.')

    def post(self, request):
        form = ForecastForm(request.POST)
        if form.is_valid():
            print form.cleaned_data
            out = check_yahoo_weather(form.cleaned_data['city'])
            return HttpResponse(str(out))


class ForecastParamView(FormView):
    template_name = 'weather/forecast_parameter.html'
    form_class = ForecastForm
    success_url = '/forecast'

    def from_valid(self, form):
        return super(ForecastParamView, self).form_valid(form)