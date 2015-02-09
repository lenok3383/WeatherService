from django.core import validators
from django.db import models
from django.contrib.auth.models import User

CHOICES_DAY = (('0', 'today'), ('1', 'tommorow'), ('2', 'day after tomorrow'))
CHOICES_SERVICES = (('YAHOO weather', 'YAHOO weather'),
                    ('WORLD WEATHER ONLINE', 'WORLD WEATHER ONLINE'))


class PreviousForecastModel(models.Model):
    city = models.CharField(max_length='30', blank=False,
                validators=[validators.RegexValidator(regex=r'^[a-zA-z ]+$')])
    services_name = models.CharField(max_length='30',  default='0',
                                     choices=CHOICES_SERVICES)
    forecast_day = models.CharField(max_length='1', default='0',
                                    choices=CHOICES_DAY)
    user_id = models.ForeignKey(User)

    class Meta:
        db_table = "previous"
