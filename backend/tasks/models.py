from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#7D9B76')

    class Meta:
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return self.name


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.CharField(choices=PRIORITY_CHOICES, max_length=10, default='medium')
    due_date = models.DateField(null=True, blank=True)
    estimated_minutes = models.PositiveIntegerField(null=True, blank=True)
    actual_minutes = models.PositiveIntegerField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_complete', 'due_date', 'created_at']

    def __str__(self):
        return self.title

    def is_overdue(self):
        from datetime import date
        if not self.due_date or self.is_complete:
            return False
        return self.due_date < date.today()

    def needs_attention(self):
        from datetime import date
        if self.is_complete or self.deleted_at:
            return False
        return self.is_overdue() or self.priority == 'high'
