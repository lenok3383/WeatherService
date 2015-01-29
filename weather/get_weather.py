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


class ResposceDataError(BaseWeatherException):
    pass


def check_world_weather_online(city):
    out = {'weather': {}}
    wwo_key = 'caccf05de4bf3a130dcd49c9a79d5'
    wwo_bas = "http://api.worldweatheronline.com/free/v2/weather.ashx"
    wwo_params = {'q': city, 'format': 'json',
                  'num_of_days': '3', 'key': wwo_key}

    url_parts = list(urlparse.urlparse(wwo_bas))
    wwo_url = dict(urlparse.parse_qsl(url_parts[4]))
    wwo_url.update(wwo_params)
    url_parts[4] = urllib.urlencode(wwo_url)
    wwo_url = urlparse.urlunparse(url_parts)

    try:
        result = urllib2.urlopen(wwo_url).read()
    except urllib2.URLError, err:
        raise ConnectionToServerError(err)

    try:
        data = json.loads(result)
        if data['data'].has_key('error'):
            raise ResposceDataError("Error. Invalid Input. City not found")
    except (ValueError, LookupError):
        raise ResposceDataError("Error. Invalid Input. City not found")

    try:
        if len(data['data']['request'][0]['query'].split(',')) == 2:
            out['location'] = {
                'city': data['data']['request'][0]['query'].split(',')[0],
                'country': data['data']['request'][0]['query'].split(',')[1]}
        else:
            out['location'] = out['location'] = {
                'city': data['data']['request'][0]['query'].split(',')[1],
                'country': data['data']['request'][0]['query'].split(',')[2]}
        data = data['data']['weather']

        for day in range(0, 3):
            out['weather'][str(day)] = {'maxtemp': data[day]['maxtempC'],
                                        'mintemp': data[day]['mintempC']}
    except KeyError:
        raise ResposceDataError("World weather online changes API")
    return out


def check_yahoo_weather(city):
    out = {'weather': {}}
    base_url = "https://query.yahooapis.com/v1/public/yql"
    yql_query = "SELECT * FROM weather.bylocation WHERE unit='c' " \
                "AND location= '{}'".format(city.replace(' ', '_'))
    yql_params = {'q': yql_query, 'format': 'json',
                  'env': 'store://datatables.org/alltableswithkeys'}

    url_parts = list(urlparse.urlparse(base_url))
    yahoo_url = dict(urlparse.parse_qsl(url_parts[4]))
    yahoo_url.update(yql_params)
    url_parts[4] = urllib.urlencode(yahoo_url)
    yahoo_url = urlparse.urlunparse(url_parts)

    try:
        result = urllib2.urlopen(yahoo_url).read()
    except urllib2.URLError, err:
        raise ConnectionToServerError(err)

    try:
        data = json.loads(result)

        if not data['query']['results']['weather']['rss']['channel']['item'] \
                .has_key('forecast'):
            raise ResposceDataError("Error. Invalid Input. City not found")
    except (TypeError, KeyError, ValueError):
        raise ResposceDataError("Error. Invalid Input. City not found1")

    try:
        data = data['query']['results']['weather']['rss']['channel']
        out['location'] = {'city': data['title'].split('-')[1].split(',')[0],
                           'country': data['title'].split('-')[1].split(',')[1]}

        data = data['item']['forecast']
        for day in range(0, 3):
            out['weather'][str(day)] = {'maxtemp': data[day]['high'],
                                        'mintemp': data[day]['low']}

    except KeyError:
        raise ResposceDataError("Yahoo weather changes API")
    return out
