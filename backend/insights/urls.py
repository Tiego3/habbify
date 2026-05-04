from django.urls import path
from .views import insights, calendar_view

urlpatterns = [
    path('insights/', insights, name='insights'),
    path('calendar/', calendar_view, name='calendar'),
]
