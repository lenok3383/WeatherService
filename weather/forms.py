from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from weather.models import PreviousForecastModel

CHOICES_DAY = (('0', 'today'), ('1', 'tommorow'), ('2', 'day after tomorrow'))
CHOICES_SERVICES = (('0', 'yahoo'), ('1', 'world weather online'))


class ForecastForm(forms.ModelForm):
    class Meta:
        model = PreviousForecastModel
        fields = ['city', 'services_name', 'forecast_day']


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.TextInput(
        attrs={'placeholder': 'E-mail address'}))
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=False)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email',
                  'username', 'password1', 'password2')
