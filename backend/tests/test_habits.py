import pytest
from datetime import date, timedelta
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from habits.models import Habit, HabitLog


@pytest.fixture
def user(db):
    return User.objects.create_user(username='habituser', password='testpass123')


@pytest.fixture
def client(user):
    c = APIClient()
    resp = c.post('/api/token/', {'username': 'habituser', 'password': 'testpass123'})
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return c


@pytest.mark.django_db
def test_create_habit(client):
    resp = client.post('/api/habits/', {
        'name': 'Morning run',
        'category': 'Health',
        'frequency': 'daily',
        'color': '#7D9B76',
    })
    assert resp.status_code == 201
    assert resp.data['name'] == 'Morning run'


@pytest.mark.django_db
def test_log_habit(client, user):
    habit = Habit.objects.create(user=user, name='Meditate', frequency='daily')
    today = date.today().isoformat()
    resp = client.post(f'/api/habits/{habit.id}/log/', {
        'date': today,
        'completed': True,
        'note': 'Felt good',
    })
    assert resp.status_code == 200
    assert resp.data['completed'] is True


@pytest.mark.django_db
def test_habit_streak_logic(user):
    habit = Habit.objects.create(user=user, name='Read', frequency='daily', grace_days=0)
    today = date.today()
    for i in range(5):
        HabitLog.objects.create(habit=habit, date=today - timedelta(days=i), completed=True)
    assert habit.get_current_streak() == 5


@pytest.mark.django_db
def test_habit_streak_with_grace(user):
    habit = Habit.objects.create(user=user, name='Exercise', frequency='daily', grace_days=1)
    today = date.today()
    # Complete today, skip yesterday, complete 2 days ago
    HabitLog.objects.create(habit=habit, date=today, completed=True)
    HabitLog.objects.create(habit=habit, date=today - timedelta(days=1), completed=False)
    HabitLog.objects.create(habit=habit, date=today - timedelta(days=2), completed=True)
    # With 1 grace day, streak should not break
    streak = habit.get_current_streak()
    assert streak >= 2


@pytest.mark.django_db
def test_habit_stats(client, user):
    habit = Habit.objects.create(user=user, name='Journal', frequency='daily')
    today = date.today()
    for i in range(3):
        HabitLog.objects.create(habit=habit, date=today - timedelta(days=i), completed=True)
    resp = client.get(f'/api/habits/{habit.id}/stats/')
    assert resp.status_code == 200
    assert 'current_streak' in resp.data
    assert 'heatmap_data' in resp.data
    assert resp.data['current_streak'] == 3


@pytest.mark.django_db
def test_idempotent_log(client, user):
    habit = Habit.objects.create(user=user, name='Water', frequency='daily')
    today = date.today().isoformat()
    client.post(f'/api/habits/{habit.id}/log/', {'date': today, 'completed': True})
    resp = client.post(f'/api/habits/{habit.id}/log/', {'date': today, 'completed': False})
    assert resp.status_code == 200
    assert resp.data['completed'] is False
    assert HabitLog.objects.filter(habit=habit).count() == 1


@pytest.mark.django_db
def test_archive_habit(client, user):
    habit = Habit.objects.create(user=user, name='Old habit', frequency='daily')
    resp = client.patch(f'/api/habits/{habit.id}/', {'is_archived': True})
    assert resp.status_code == 200
    list_resp = client.get('/api/habits/')
    names = [h['name'] for h in list_resp.data['results']]
    assert 'Old habit' not in names
