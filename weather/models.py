from django.core import validators
from django.db import models
from django.contrib.auth.models import User


class PreviousForecastModel(models.Model):
    SERVICE_YAHOO = 'YAHOO weather'
    SERVICE_WWO = 'WORLD WEATHER ONLINE'

    DAY_0 = 'today'
    DAY_1 = 'tommorow'
    DAY_2 = 'day after tomorrow'

    CHOICES_SERVICES = ((SERVICE_YAHOO, 'YAHOO weather'),
                        (SERVICE_WWO, 'WORLD WEATHER ONLINE'))

    CHOICES_DAY = ((DAY_0, 'Today'),
                   (DAY_1, 'Tommorow'),
                   (DAY_2, 'Day after tomorrow'))

    city = models.CharField(max_length='30', blank=False,
                            validators=[validators.RegexValidator(
                                regex=r'^[a-zA-z ]+$')])
    services_name = models.CharField(max_length='30', default=SERVICE_YAHOO,
                                     choices=CHOICES_SERVICES)
    forecast_day = models.CharField(max_length='30', default=DAY_0,
                                    choices=CHOICES_DAY)
    user_id = models.ForeignKey(User)

    class Meta:
        db_table = "previous"
