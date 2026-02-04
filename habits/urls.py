from django.urls import path
from . import views

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('habit/new/', views.HabitCreateView.as_view(), name='habit_create'),
    path('habit/<int:pk>/edit/', views.HabitUpdateView.as_view(), name='habit_edit'),
    path('habit/<int:pk>/delete/', views.HabitDeleteView.as_view(), name='habit_delete'),
    path('habit/<int:pk>/toggle/', views.toggle_progress, name='habit_toggle'),
    path('history/<int:pk>/', views.history_view, name='habit_history'),
    path('api/habit/<int:pk>/chart-data/', views.habit_chart_data, name='habit_chart_data'),
]
