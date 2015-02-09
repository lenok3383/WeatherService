# -*- coding: utf-8 -*-
"""
Weather service
---------------
The console script should query the user for a city name.

The script will then contact several web weather services and fetch tomorrow's
weather for the specified city. Tomorrow's date and weather data from different
services will be printed.
If a service cannot be accessed, an error message will be shown instead of
weather data from this service; data from other services should be fetched
regardless of the failure.
The script should cancel gracefully in case of keyboard interrupt.
"""

import urllib2
import urllib
import urlparse
import json


class BaseWeatherException(Exception):
    pass


class ConnectionToServerError(BaseWeatherException):
    pass


class ResponseDataError(BaseWeatherException):
    pass


class GetWeather(object):


    class ForecastData():
        city = None
        country = None
        weather = {}

        def get_temperature (self, day):
            return self.weather[str(day)]

    def _url_for_request(self, url_base, url_data):
        url_parts = list(urlparse.urlparse(url_base))
        url = dict(urlparse.parse_qsl(url_parts[4]))
        url.update(url_data)
        url_parts[4] = urllib.urlencode(url)
        url = urlparse.urlunparse(url_parts)
        return url

    def world_weather_online(self, city):
        forecast_for = self.ForecastData()
        wwo_key = 'caccf05de4bf3a130dcd49c9a79d5'
        wwo_bas = "http://api.worldweatheronline.com/free/v2/weather.ashx"
        wwo_params = {'q': city, 'format': 'json',
                      'num_of_days': '3', 'key': wwo_key}

        wwo_url = self._url_for_request(wwo_bas, wwo_params)

        try:
            result = urllib2.urlopen(wwo_url).read()
        except urllib2.URLError, err:
            raise ConnectionToServerError(err)

        try:
            data = json.loads(result)
            if data['data'].has_key('error'):
                raise ResponseDataError("Error. Invalid Input. City not found")
        except (ValueError, LookupError):
            raise ResponseDataError("Error. Invalid Input. City not found")

        try:
            if len(data['data']['request'][0]['query'].split(',')) == 2:
                forecast_for.city = data['data']['request'][0]['query'].split(',')[0]
                forecast_for.country = data['data']['request'][0]['query'].split(',')[1]
            else:
                forecast_for.city = data['data']['request'][0]['query'].split(',')[1]
                forecast_for.country = data['data']['request'][0]['query'].split(',')[2]

            data = data['data']['weather']

            for day in range(0, 3):
                forecast_for.weather[str(day)] = {
                                'maxtemp': data[day]['maxtempC'],
                                'mintemp': data[day]['mintempC']}
        except KeyError:
            raise ResponseDataError("World weather online changes API")
        return forecast_for

    def yahoo_weather(self, city):
        forecast_for = self.ForecastData()
        base_url = "https://query.yahooapis.com/v1/public/yql"
        yql_query = "SELECT * FROM weather.bylocation WHERE unit='c' " \
                    "AND location= '{}'".format(city.replace(' ', '_'))
        yql_params = {'q': yql_query, 'format': 'json',
                      'env': 'store://datatables.org/alltableswithkeys'}

        yahoo_url = self._url_for_request(base_url, yql_params)

        try:
            result = urllib2.urlopen(yahoo_url).read()
        except urllib2.URLError, err:
            raise ConnectionToServerError(err)

        try:
            data = json.loads(result)

            if not data['query']['results']['weather']['rss']['channel']\
                                        ['item'].has_key('forecast'):
                raise ResponseDataError("Error. Invalid Input. City not found")
        except (TypeError, KeyError, ValueError):
            raise ResponseDataError("Error. Invalid Input. City not found1")

        try:
            data = data['query']['results']['weather']['rss']['channel']
            forecast_for.city = data['title'].split('-')[1].split(',')[0]
            forecast_for.country = data['title'].split('-')[1].split(',')[1]

            data = data['item']['forecast']
            for day in range(0, 3):
                forecast_for.weather[str(day)] = {
                                        'maxtemp': data[day]['high'],
                                        'mintemp': data[day]['low']}
        except KeyError:
            raise ResponseDataError("Yahoo weather changes API")
        return forecast_for

    WEATHER_SERVICES = {'YAHOO weather': yahoo_weather,
                        'WORLD WEATHER ONLINE': world_weather_online}

    def weather_by_service_name(self, service_name, city):
        return self.WEATHER_SERVICES[str(service_name)](self, city)

