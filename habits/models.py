from django.db import models

from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta

FREQ_CHOICES = [
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
]

CATEGORY_CHOICES = [
    ('health', 'Health'),
    ('work', 'Work'),
    ('learning', 'Learning'),
    ('mindset', 'Mindset'),
    ('other', 'Other'),
]

class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=120)
    frequency = models.CharField(max_length=10, choices=FREQ_CHOICES, default='daily')
    goal = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(default=date.today)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    color = models.CharField(max_length=7, blank=True, help_text='Optional hex color e.g. #aabbcc')

    def __str__(self):
        return self.name

    def completion_count(self):
        return self.progress.filter(completed=True).count()

    def completed_today(self):
        return self.progress.filter(date=date.today(), completed=True).exists()

    def current_streak(self):
        """Return current consecutive completed days (daily frequency). Works best for daily habits."""
        if self.frequency != 'daily':
            # For simplicity only compute daily streaks here
            return 0
        streak = 0
        day = date.today()
        # Walk back while completed
        while True:
            if self.progress.filter(date=day, completed=True).exists():
                streak += 1
                day -= timedelta(days=1)
            else:
                break
        return streak

class Progress(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='progress')
    date = models.DateField()
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('habit', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.habit.name} — {self.date} — {'done' if self.completed else 'not'}"
