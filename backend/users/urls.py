from django.urls import path
from .views import RegisterView, me, update_avatar

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('users/me/', me, name='me'),
    path('users/me/avatar/', update_avatar, name='update_avatar'),
]
