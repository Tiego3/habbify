from django.contrib import admin
from .models import Habit, Progress

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'frequency', 'category', 'start_date')

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('habit', 'date', 'completed')
    list_filter = ('completed',)

