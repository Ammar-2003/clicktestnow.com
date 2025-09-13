from django.shortcuts import redirect
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.urls import reverse

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just before the social account is logged in.
        This is where we can check if it's a new user and redirect them.
        """
        # A quick check to see if the user already has a username.
        # This prevents existing users from being redirected.
        if sociallogin.user.username:
            return

        # If it's a new user and they don't have a username,
        # we check the session for the 'next' URL to redirect them back later.
        next_url = request.session.get('next_url', None)

        # Here, we store the redirect URL in the session before the user is fully logged in.
        # This is a robust way to persist the URL across the redirection.
        if next_url:
            request.session['next_url'] = next_url
            
    def get_login_redirect_url(self, request):
        """
        This method is called after a successful social login.
        We use it to check if the user needs to set a username.
        """
        # If the user has a username, proceed to the standard redirect URL.
        # The 'username' field is typically empty for new social logins.
        if request.user.username:
            return super().get_login_redirect_url(request)
        
        # If the user does not have a username, we redirect them to the username form.
        # We also pass the original 'next' URL to the form.
        next_url = request.session.get('next_url', reverse('home'))
        return f"{reverse('set_username')}?next={next_url}"