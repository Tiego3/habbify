import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_register():
    c = APIClient()
    resp = c.post('/api/auth/register/', {
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'securepass123',
    })
    assert resp.status_code == 201
    assert 'access' in resp.data
    assert 'refresh' in resp.data
    assert User.objects.filter(username='newuser').exists()


@pytest.mark.django_db
def test_register_duplicate_username(db):
    User.objects.create_user(username='existing', password='pass1234')
    c = APIClient()
    resp = c.post('/api/auth/register/', {
        'username': 'existing',
        'email': 'other@example.com',
        'password': 'pass1234',
    })
    assert resp.status_code == 400


@pytest.mark.django_db
def test_token_obtain(db):
    User.objects.create_user(username='tokenuser', password='pass1234')
    c = APIClient()
    resp = c.post('/api/token/', {'username': 'tokenuser', 'password': 'pass1234'})
    assert resp.status_code == 200
    assert 'access' in resp.data


@pytest.mark.django_db
def test_me_endpoint(db):
    user = User.objects.create_user(username='meuser', password='pass1234')
    c = APIClient()
    token_resp = c.post('/api/token/', {'username': 'meuser', 'password': 'pass1234'})
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")
    resp = c.get('/api/users/me/')
    assert resp.status_code == 200
    assert resp.data['username'] == 'meuser'


@pytest.mark.django_db
def test_me_unauthenticated(db):
    c = APIClient()
    resp = c.get('/api/users/me/')
    assert resp.status_code == 401


@pytest.mark.django_db
def test_profile_update(db):
    user = User.objects.create_user(username='profuser', password='pass1234')
    c = APIClient()
    token_resp = c.post('/api/token/', {'username': 'profuser', 'password': 'pass1234'})
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")
    resp = c.patch('/api/users/me/', {
        'profile': {
            'display_name': 'Prof User',
            'zen_mode': True,
            'theme': 'dark',
        }
    }, format='json')
    assert resp.status_code == 200
    assert resp.data['profile']['display_name'] == 'Prof User'
    assert resp.data['profile']['zen_mode'] is True
