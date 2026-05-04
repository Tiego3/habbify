from django.db import models
from django.contrib.auth.models import User
from datetime import date, timedelta


class Habit(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True)
    frequency = models.CharField(choices=FREQUENCY_CHOICES, max_length=10, default='daily')
    custom_days = models.JSONField(default=list, blank=True)  # [0,2,4] = Mon,Wed,Fri
    color = models.CharField(max_length=7, default='#7D9B76')
    grace_days = models.PositiveSmallIntegerField(default=1)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()})"

    def is_scheduled_today(self):
        today = date.today()
        if self.frequency == 'daily':
            return True
        if self.frequency == 'weekly':
            return today.weekday() == 0  # Monday
        if self.frequency == 'custom':
            return today.weekday() in (self.custom_days or [])
        return False

    def is_completed_today(self):
        return self.logs.filter(date=date.today(), completed=True).exists()

    def get_current_streak(self):
        """
        Count consecutive completed scheduled days backwards from today.
        Grace days: a missed day within the grace window doesn't break the streak.
        """
        logs = {log.date: log.completed for log in self.logs.all()}
        today = date.today()
        streak = 0
        missed_in_grace = 0
        check = today

        while True:
            if self._is_scheduled(check):
                completed = logs.get(check, False)
                if completed:
                    streak += 1
                    missed_in_grace = 0
                else:
                    missed_in_grace += 1
                    if missed_in_grace > self.grace_days:
                        break
            check -= timedelta(days=1)
            # Stop after a year of looking back
            if (today - check).days > 365:
                break

        return streak

    def get_longest_streak(self):
        logs = sorted(
            [log.date for log in self.logs.filter(completed=True)],
            reverse=True
        )
        if not logs:
            return 0

        longest = 1
        current = 1
        for i in range(1, len(logs)):
            diff = (logs[i - 1] - logs[i]).days
            if diff == 1:
                current += 1
                longest = max(longest, current)
            else:
                current = 1
        return longest

    def _is_scheduled(self, check_date):
        if self.frequency == 'daily':
            return True
        if self.frequency == 'weekly':
            return check_date.weekday() == 0
        if self.frequency == 'custom':
            return check_date.weekday() in (self.custom_days or [])
        return False

    def get_completion_rate(self, days=30):
        today = date.today()
        start = today - timedelta(days=days - 1)
        scheduled = sum(1 for i in range(days) if self._is_scheduled(start + timedelta(days=i)))
        if scheduled == 0:
            return 0
        completed = self.logs.filter(
            date__gte=start, date__lte=today, completed=True
        ).count()
        return round((completed / scheduled) * 100)

    def get_heatmap_data(self, days=365):
        today = date.today()
        start = today - timedelta(days=days - 1)
        log_map = {log.date: log.completed for log in self.logs.filter(date__gte=start)}
        result = []
        for i in range(days):
            d = start + timedelta(days=i)
            result.append({
                'date': d.isoformat(),
                'completed': log_map.get(d, False),
                'scheduled': self._is_scheduled(d),
            })
        return result


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ('habit', 'date')
        ordering = ['-date']

    def __str__(self):
        status = '✓' if self.completed else '✗'
        return f"{self.habit.name} {self.date} {status}"
