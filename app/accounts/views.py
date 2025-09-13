from django.views.generic.edit import CreateView, FormView
from django.urls import reverse_lazy
from django.contrib import messages
from .forms import UserRegistrationForm, OTPVerificationForm, LoginForm , SetUsernameForm
from .models import User, OneTimePassword
from .utils import send_generated_otp_to_email
from django.contrib.auth import authenticate, login
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.urls import reverse

class UserRegisterView(CreateView):
    model = User
    form_class = UserRegistrationForm
    template_name = 'accounts/register.html'
    success_url = reverse_lazy('otp-verify')

    def form_valid(self, form):
        user = form.save(commit=False)
        user.set_password(form.cleaned_data['password'])
        user.is_active = False
        user.save()
        send_generated_otp_to_email(user.email, self.request)
        messages.success(self.request, 'Thanks for signing up! A passcode has been sent to your email. Please dont forget to check your spam folder')
        # Set session flag that user has registered
        self.request.session['user_registered'] = True
        self.request.session['registering_email'] = user.email  # Store email for verification
        return super().form_valid(form)

class VerifyOTPView(FormView):
    template_name = 'accounts/otp-verify.html'
    form_class = OTPVerificationForm
    success_url = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        if 'registering_email' not in request.session:
            messages.error(request, "Session expired or invalid access. Please register again.")
            return redirect('register')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        otp_input = form.cleaned_data['otp']
        email = self.request.session.get('registering_email')
        try:
            user = User.objects.get(email=email)
            otp_obj = OneTimePassword.objects.get(user=user)
            if otp_obj.otp == otp_input:
                user.is_active = True
                user.is_verified = True
                user.save()
                otp_obj.delete()
                # Keep the user_registered flag but remove the email
                del self.request.session['registering_email']
                messages.success(self.request, "Your account has been verified. You can now login.")
                return super().form_valid(form)
            else:
                messages.error(self.request, "Invalid OTP. Please try again.")
        except User.DoesNotExist:
            messages.error(self.request, "User not found.")
        except OneTimePassword.DoesNotExist:
            messages.error(self.request, "OTP has expired or is invalid.")
        return self.form_invalid(form)
    
def resend_otp(request):
    """
    A view to handle the resend OTP functionality.
    """
    email = request.session.get('registering_email')
    if not email:
        messages.error(request, "Session expired or invalid access. Please register again.")
        return redirect('register')
    
    try:
        user = User.objects.get(email=email)
        send_generated_otp_to_email(user.email, request)
        messages.success(request, 'A new passcode has been sent to your email.')
    except User.DoesNotExist:
        messages.error(request, "User not found.")
    
    return redirect('otp-verify')

class UserLoginView(FormView):
    template_name = 'accounts/login.html'
    form_class = LoginForm
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        user = authenticate(self.request, email=email, password=password)
        if user is not None:
            if user.is_verified:
                login(self.request, user)
                # Clear the registration flag on successful login
                if 'user_registered' in self.request.session:
                    del self.request.session['user_registered']
                    return redirect('home')
                messages.success(self.request, f"Successfully logged in as {user.get_full_name}")
                return super().form_valid(form)
            else:
                messages.error(self.request, "Please verify your email before logging in.")
        else:
            messages.error(self.request, "Invalid email or password.")
        return self.form_invalid(form)

def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('login')

@login_required
def set_username(request):
    if request.method == "POST":
        form = SetUsernameForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            # Redirect to the `next` param if present, else home
            next_url = request.GET.get("next") or reverse("home")
            return redirect(next_url)
    else:
        form = SetUsernameForm(instance=request.user)

    return render(request, "accounts/set_username.html", {"form": form})




