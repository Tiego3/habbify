# todo_project/todo_app/admin.py
from django.contrib import admin
from .models import UserProfile, Task, Habit, HabitLog, Notification


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['custom_name', 'user', 'productivity_preference', 'onboarding_completed', 'created_at']
    list_filter = ['productivity_preference', 'onboarding_completed']
    search_fields = ['custom_name', 'user__username', 'user__email']
    readonly_fields = ['created_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'priority', 'due_date', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'priority', 'reminder_set', 'created_at']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'title', 'description')
        }),
        ('Scheduling', {
            'fields': ('due_date', 'due_time', 'priority')
        }),
        ('Status', {
            'fields': ('is_completed', 'completed_at', 'reminder_set', 'reminder_sent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'frequency', 'reminder_time', 'is_active', 'created_at']
    list_filter = ['is_active', 'frequency', 'created_at']
    search_fields = ['title', 'goal_description', 'user__username']
    readonly_fields = ['created_at']


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ['habit', 'log_date', 'is_completed', 'completed_at']
    list_filter = ['is_completed', 'log_date']
    search_fields = ['habit__title', 'habit__user__username']
    date_hierarchy = 'log_date'
    readonly_fields = ['completed_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


