from django.conf.urls import patterns, include, url
from django.contrib import admin
import weather.views as view

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'polyweather.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'index/', view.IndexPage.as_view(), name="single"),

    url(r'^weather/', view.ForecastParamView.as_view(), name="weather_page"),
    url(r'^forecast/(?P<forecast_id>\d+)/', view.ForecastView.as_view(),
                                                    name="forecast_page"),
    url(r'^error/', view.ErrorView.as_view(), name="error_page"),

    url(r'^$', view.LogInView.as_view(), name="log_in"),
    url(r'^logout/', 'django.contrib.auth.views.logout',
                                        {'template_name': 'logout.html'}),
    url(r'^registration/',  view.RegistrationView.as_view(), name="reg_page"),
    url(r'history/', view.History.as_view(), name="history"),
    url(r'^admin/', include(admin.site.urls)),
)
