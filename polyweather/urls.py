from django.conf.urls import patterns, include, url
from django.contrib import admin
from weather.views import ForecastParamView, ForecastView

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'polyweather.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^weather/', ForecastParamView.as_view()),
    url(r'^forecast/', ForecastView.as_view()),

    url(r'^admin/', include(admin.site.urls)),
)
