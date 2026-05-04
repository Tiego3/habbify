"""Development settings — debug on, debug toolbar, sqlite."""
from .base import *  # noqa: F401,F403

SECRET_KEY = 'django-insecure-dev-only-do-not-use-in-production'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = INSTALLED_APPS + ['debug_toolbar']  # noqa: F405

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE  # noqa: F405

INTERNAL_IPS = ['127.0.0.1']
