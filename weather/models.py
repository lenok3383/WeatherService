from django.core import validators
from django.db import models
from django.contrib.auth.models import User

CHOICES_DAY = (('0', 'today'), ('1', 'tommorow'), ('2', 'day after tomorrow'))
CHOICES_SERVICES = (('0', 'yahoo'), ('1', 'world weather online'))


class PreviousForecastModel(models.Model):
    city = models.CharField(max_length='30', blank=False,
                validators=[validators.RegexValidator(regex=r'^[a-zA-z ]+$')])
    services_name = models.CharField(max_length='1',  default='0',
                                     choices=CHOICES_SERVICES)
    forecast_day = models.CharField(max_length='1', default='0',
                                    choices=CHOICES_DAY)
    user_id = models.ForeignKey(User)

    class Meta:
        db_table = "previous"

    def get_dict_data(self):
        return dict(city=self.city, forecast_day=self.forecast_day,
                    services_name=self.services_name)
