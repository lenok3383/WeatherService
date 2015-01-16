from django import forms

CHOICES_DAY = (('1','today',), ('2', 'tommorow',), ('3', 'next sunday',))
CHOICES_SERVICES = (('1','yahoo'), ('2', 'world weather online'))


class ForecastForm(forms.Form):
    city = forms.CharField(max_length=25)
    services_name = forms.BooleanField(label="yahoo")
    forecast_day = forms.ChoiceField(choices=CHOICES_DAY)

