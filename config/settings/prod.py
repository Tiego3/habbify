"""Production settings — debug off, env-driven secrets."""
import os
from .base import *  # noqa: F401,F403

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Use a database URL in prod: DATABASE_URL env var
# pip install dj-database-url to activate
try:
    import dj_database_url  # noqa: F401
    DATABASES = {  # noqa: F405
        'default': dj_database_url.config(conn_max_age=600)
    }
except ImportError:
    pass

SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
