from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    THEME_CHOICES = [('light', 'Light'), ('dark', 'Dark')]
    GOAL_CHOICES = [
        'Build discipline',
        'Improve health',
        'Stay organized',
        'Learn consistently',
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    display_name = models.CharField(max_length=100, blank=True)
    goals = models.JSONField(default=list)
    accent_color = models.CharField(max_length=7, default='#7D9B76')
    zen_mode = models.BooleanField(default=False)
    theme = models.CharField(choices=THEME_CHOICES, default='light', max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
