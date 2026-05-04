# todo_app/context_processors.py

def user_profile(request):
    """Inject the user's profile into every template context so theme/colors apply globally."""
    if request.user.is_authenticated:
        try:
            return {'profile': request.user.profile}
        except Exception:
            return {'profile': None}
    return {'profile': None}
