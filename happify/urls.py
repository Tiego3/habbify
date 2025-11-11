from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views  # <-- import auth_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication (login/logout)
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),

    # Include default Django auth URLs (password reset, etc.)
    path('accounts/', include('django.contrib.auth.urls')),

    # Custom user URLs (e.g., signup)
    path('accounts/', include('users.urls')),

    # Main app (habits)
    path('', include('habits.urls')),

    # Redirect root to dashboard (if needed)
    path('', RedirectView.as_view(pattern_name='dashboard', permanent=False)),
]
