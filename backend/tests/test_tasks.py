import pytest
from datetime import date, timedelta
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def user(db):
    return User.objects.create_user(username='testuser', password='testpass123')


@pytest.fixture
def client(user):
    c = APIClient()
    resp = c.post('/api/token/', {'username': 'testuser', 'password': 'testpass123'})
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return c


@pytest.mark.django_db
def test_create_task(client):
    resp = client.post('/api/tasks/', {
        'title': 'Write tests',
        'priority': 'high',
        'due_date': str(date.today() + timedelta(days=1)),
    })
    assert resp.status_code == 201
    assert resp.data['title'] == 'Write tests'
    assert resp.data['priority'] == 'high'


@pytest.mark.django_db
def test_list_tasks(client):
    client.post('/api/tasks/', {'title': 'Task A', 'priority': 'low'})
    client.post('/api/tasks/', {'title': 'Task B', 'priority': 'medium'})
    resp = client.get('/api/tasks/')
    assert resp.status_code == 200
    assert resp.data['count'] == 2


@pytest.mark.django_db
def test_complete_task(client):
    create = client.post('/api/tasks/', {'title': 'Do something', 'priority': 'medium'})
    task_id = create.data['id']
    resp = client.post(f'/api/tasks/{task_id}/complete/')
    assert resp.status_code == 200
    assert resp.data['is_complete'] is True
    assert resp.data['completed_at'] is not None


@pytest.mark.django_db
def test_soft_delete_task(client):
    create = client.post('/api/tasks/', {'title': 'Deletable', 'priority': 'low'})
    task_id = create.data['id']
    resp = client.delete(f'/api/tasks/{task_id}/')
    assert resp.status_code == 204
    # Should not appear in list
    list_resp = client.get('/api/tasks/')
    titles = [t['title'] for t in list_resp.data['results']]
    assert 'Deletable' not in titles


@pytest.mark.django_db
def test_overdue_task(client):
    resp = client.post('/api/tasks/', {
        'title': 'Overdue task',
        'priority': 'medium',
        'due_date': str(date.today() - timedelta(days=1)),
    })
    assert resp.data['is_overdue'] is True


@pytest.mark.django_db
def test_needs_attention_tab(client):
    client.post('/api/tasks/', {
        'title': 'High prio',
        'priority': 'high',
    })
    resp = client.get('/api/tasks/?tab=attention')
    assert resp.status_code == 200
    assert resp.data['count'] >= 1


@pytest.mark.django_db
def test_bulk_complete(client):
    t1 = client.post('/api/tasks/', {'title': 'T1', 'priority': 'low'}).data['id']
    t2 = client.post('/api/tasks/', {'title': 'T2', 'priority': 'low'}).data['id']
    resp = client.post('/api/tasks/bulk-complete/', {'ids': [t1, t2]}, format='json')
    assert resp.status_code == 200
    assert resp.data['updated'] == 2


@pytest.mark.django_db
def test_tasks_isolated_between_users(db):
    User.objects.create_user(username='user_a', password='pass1234')
    User.objects.create_user(username='user_b', password='pass1234')
    c1 = APIClient()
    c2 = APIClient()
    r1 = c1.post('/api/token/', {'username': 'user_a', 'password': 'pass1234'})
    r2 = c2.post('/api/token/', {'username': 'user_b', 'password': 'pass1234'})
    c1.credentials(HTTP_AUTHORIZATION=f"Bearer {r1.data['access']}")
    c2.credentials(HTTP_AUTHORIZATION=f"Bearer {r2.data['access']}")

    c1.post('/api/tasks/', {'title': 'User A task', 'priority': 'low'})
    resp = c2.get('/api/tasks/')
    assert resp.data['count'] == 0
