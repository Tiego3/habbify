from django.urls import path
from .views import chat, insight

urlpatterns = [
    path('chat/', chat, name='ai_chat'),
    path('insight/', insight, name='ai_insight'),
]
