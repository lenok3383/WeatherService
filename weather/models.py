from django.core import validators
from django.db import models
from django.contrib.auth.models import User


class PreviousForecastModel(models.Model):
    SERVICE_YAHOO = 'YAHOO weather'
    SERVICE_WWO = 'WORLD WEATHER ONLINE'

    TODAY = 'today'
    TOMMOROW = "tommorow"
    DAY_AFTER_TOMMOROW = 'day after tomorrow'

    CHOICES_SERVICES = ((SERVICE_YAHOO, 'YAHOO weather'),
                        (SERVICE_WWO, 'WORLD WEATHER ONLINE'))

    CHOICES_DAY = ((TODAY, 'Today'),
                   (TOMMOROW, 'Tommorow'),
                   (DAY_AFTER_TOMMOROW, 'Day after tomorrow'))

    city = models.CharField(max_length='30', blank=False,
                            validators=[validators.RegexValidator(
                                regex=r'^[a-zA-z ]+$')])
    services_name = models.CharField(max_length='30', default=SERVICE_YAHOO,
                                     choices=CHOICES_SERVICES)
    forecast_day = models.CharField(max_length='30', default=TODAY,
                                    choices=CHOICES_DAY)
    user_id = models.ForeignKey(User)

    class Meta:
        db_table = "previous"
