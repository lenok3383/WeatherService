from django.conf.urls import patterns, include, url
from django.contrib import admin
from weather.views import ForecastParamView, ForecastView, my_error

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'polyweather.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^weather/', ForecastParamView.as_view(), name="_weather"),
    url(r'^forecast', ForecastView.as_view(), name="_forecast"),
    url(r'^error/', my_error, name="err_page"),

    url(r'^admin/', include(admin.site.urls)),
)
