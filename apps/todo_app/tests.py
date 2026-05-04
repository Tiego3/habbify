"""Tests for Task and Habit models."""
import pytest
from datetime import date, timedelta
from django.contrib.auth.models import User
from django.utils import timezone

from todo_app.models import Task, Habit, HabitLog, PRIORITY_CHOICES


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def user(db):
    return User.objects.create_user(username='testuser', password='pass')


@pytest.fixture
def task(user):
    return Task.objects.create(
        user=user,
        title='Write tests',
        priority=2,
    )


@pytest.fixture
def habit(user):
    return Habit.objects.create(
        user=user,
        title='Morning run',
        goal_description='Run 5km every morning',
        frequency='daily',
    )


# ---------------------------------------------------------------------------
# Task model
# ---------------------------------------------------------------------------

class TestTaskModel:
    def test_str(self, task):
        assert str(task) == 'Write tests'

    def test_default_not_completed(self, task):
        assert task.is_completed is False
        assert task.completed_at is None

    def test_default_not_deleted(self, task):
        assert task.deleted_at is None

    def test_is_overdue_no_due_date(self, task):
        assert task.is_overdue() is False

    def test_is_overdue_future_date(self, task):
        task.due_date = date.today() + timedelta(days=3)
        assert task.is_overdue() is False

    def test_is_overdue_past_date(self, task):
        task.due_date = date.today() - timedelta(days=1)
        task.save()
        assert task.is_overdue() is True

    def test_is_overdue_completed_task_never_overdue(self, task):
        task.due_date = date.today() - timedelta(days=5)
        task.is_completed = True
        task.save()
        assert task.is_overdue() is False

    def test_priority_choices_labels(self):
        labels = {v: l for v, l in PRIORITY_CHOICES}
        assert labels[1] == 'High'
        assert labels[2] == 'Medium'
        assert labels[3] == 'Low'

    def test_soft_delete(self, task):
        task.deleted_at = timezone.now()
        task.save()
        assert Task.objects.filter(pk=task.pk, deleted_at__isnull=True).count() == 0
        assert Task.objects.filter(pk=task.pk, deleted_at__isnull=False).count() == 1

    def test_restore(self, task):
        task.deleted_at = timezone.now()
        task.save()
        task.deleted_at = None
        task.save()
        assert Task.objects.filter(pk=task.pk, deleted_at__isnull=True).count() == 1


# ---------------------------------------------------------------------------
# Habit model
# ---------------------------------------------------------------------------

class TestHabitModel:
    def test_str(self, habit):
        assert 'Morning run' in str(habit)

    def test_is_completed_today_false_initially(self, habit):
        assert habit.is_completed_today() is False

    def test_is_completed_today_after_log(self, habit):
        HabitLog.objects.create(habit=habit, log_date=date.today(), is_completed=True)
        assert habit.is_completed_today() is True

    def test_get_streak_zero_with_no_logs(self, habit):
        assert habit.get_streak() == 0

    def test_get_streak_single_day(self, habit):
        HabitLog.objects.create(habit=habit, log_date=date.today(), is_completed=True)
        assert habit.get_streak() == 1

    def test_get_streak_consecutive(self, habit):
        today = date.today()
        for i in range(5):
            HabitLog.objects.create(
                habit=habit,
                log_date=today - timedelta(days=i),
                is_completed=True,
            )
        assert habit.get_streak() == 5

    def test_get_streak_breaks_on_gap(self, habit):
        today = date.today()
        # Days 0 and 1 ok, then skip day 2, day 3 present — streak = 2
        HabitLog.objects.create(habit=habit, log_date=today, is_completed=True)
        HabitLog.objects.create(habit=habit, log_date=today - timedelta(days=1), is_completed=True)
        HabitLog.objects.create(habit=habit, log_date=today - timedelta(days=3), is_completed=True)
        assert habit.get_streak() == 2

    def test_last_14_days_length(self, habit):
        days = habit.last_14_days()
        assert len(days) == 14

    def test_last_14_days_today_is_last(self, habit):
        days = habit.last_14_days()
        assert days[-1]['is_today'] is True

    def test_last_14_days_completed_reflects_logs(self, habit):
        today = date.today()
        HabitLog.objects.create(habit=habit, log_date=today, is_completed=True)
        days = habit.last_14_days()
        assert days[-1]['completed'] is True
        assert days[-2]['completed'] is False

    def test_last_14_days_single_db_query(self, habit, django_assert_num_queries):
        # last_14_days should hit the DB exactly once (prefetch-friendly)
        with django_assert_num_queries(1):
            habit.last_14_days()
