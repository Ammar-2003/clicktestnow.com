# accounts/middleware.py
from django.utils import timezone
from datetime import timedelta
from django.urls import reverse
from django.shortcuts import redirect

class RegistrationSessionCleanupMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if 'user_registered' in request.session:
            # Clear if older than 7 days
            if timezone.now() - request.session.get('reg_time', timezone.now()) > timedelta(days=7):
                del request.session['user_registered']
                if 'registering_email' in request.session:
                    del request.session['registering_email']
        return self.get_response(request)

class UsernameRequiredMiddleware:
    """
    Middleware that forces authenticated users to set a username
    if their username is None, empty, whitespace, or 'null' string.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Avoid infinite redirect loop
            if request.path != reverse("set_username"):
                username = request.user.username

                if (
                    username is None
                    or str(username).strip() == ""
                    or str(username).strip().lower() == "null"
                ):
                    return redirect(f"{reverse('set_username')}?next={request.path}")

        return self.get_response(request)