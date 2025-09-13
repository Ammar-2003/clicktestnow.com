from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import ( 
    JitterScore , ButterflyScore , ReactionTimeScore, TwentySecondCPSTest, FiveSecondScore, HundredSecondCpsScore ,
    SixtySecondsCPSTest, CPSScore , OneSecondScore , TwoSecondScore , TenSecondCPSScore , FifteenSecondCpsTest , 
    ThirtySecondCPSTest , SpacebarScore , OneSecondSpacebarScore , TwoSecondSpacebarScore , FiveSecondSpacebarScore,
    SpacebarScore100 , SpacebarScore15 , SpacebarScore60 , SpacebarScore30,
    SpacebarScore10 , SpacebarScore20 , DinosaurScore )
import json
from django.db.models import F
from django.db import models
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


# Create your views here.

def home(request):
    return render(request , 'home.html')

def mouse_test(request):
    return render(request , 'mouse_test.html')
def keyboard_test(request):
    return render(request , 'keyboard_test.html')

@login_required
def game(request):
    return render(request , 'game/dinosaur.html')
def mouse_dpi_analyzer(request):
    return render(request , 'mouse_dpi_analyzer.html')
def sensitivity_converter(request):
    return render(request , 'sensitivity_converter.html')
def edpi_calculator(request):
    return render(request , 'edpi_calculator.html')
def polling_rate_tester(request):
    return render(request , 'polling_rate_tester.html')

def twenty_seconds_spacebar_counter(request):
    return render(request , 'spacebar/20seconds.html')




#dynamic_ones
#jitter-test

@login_required
def jitter_click_test(request):
    # Get global high score
    global_high_score = JitterScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = JitterScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's full name and username
    # This is the corrected section
    top_scores = (
        JitterScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = JitterScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = JitterScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except JitterScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "jitter.html", context)


@login_required
def save_jitter_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            jitter_score = JitterScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # ✅ Calculate rank (same score → earlier created_at wins)
            user_rank = JitterScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=jitter_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = JitterScore.get_global_high_score()
            is_new_record = global_high_score and jitter_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = JitterScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_jitter_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        JitterScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = JitterScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_jitter_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = JitterScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#cps-test

@login_required
def cps_test(request):
    # Get global high score
    global_high_score = CPSScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = CPSScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's full name and username
    top_scores = (
        CPSScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = CPSScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = CPSScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except CPSScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/cps_test.html", context)


@login_required
def save_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = CPSScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # ✅ Calculate user's rank with tie-breaking (earlier keeps higher rank)
            user_rank = CPSScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = CPSScore.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = CPSScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        CPSScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = CPSScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = CPSScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#one-second-cps-test

@login_required
def one_second_cps_test(request):
    # Get global high score
    global_high_score = OneSecondScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = OneSecondScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's full name and username
    top_scores = (
        OneSecondScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = OneSecondScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = OneSecondScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except OneSecondScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/1second.html", context)


@login_required
def save_one_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = OneSecondScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate user's rank with tie-breaker (score > OR score == with earlier created_at)
            user_rank = OneSecondScore.objects.filter(
                Q(score__gt=score) |
                Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = OneSecondScore.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            username = request.user.username or "Player"

            # 🎉 Build congrats message
            congrats_message = None
            if user_rank <= 10:
                if user_rank == 1:
                    congrats_message = f"🏆 Congrats {username}! You are now the #1 player!"
                elif user_rank == 2:
                    congrats_message = f"🥈 Well done {username}! You’re ranked #2 globally!"
                elif user_rank == 3:
                    congrats_message = f"🥉 Awesome {username}! You made it to the #3 spot!"
                else:
                    congrats_message = f"🎉 Great job {username}, you’re in the Top 10 at rank #{user_rank}!"

            # Get updated top player stats
            top_player_stats = OneSecondScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': username,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats,
                'congrats_message': congrats_message  # 👈 send to frontend for instant display
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_one_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        OneSecondScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = OneSecondScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_one_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = OneSecondScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#2-second-cps

@login_required
def two_second_test(request):
    # Get global high score
    global_high_score = TwoSecondScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = TwoSecondScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        TwoSecondScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = TwoSecondScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = TwoSecondScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except TwoSecondScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/2seconds.html", context)

@login_required
def save_two_second_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            two_second_score = TwoSecondScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = TwoSecondScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=two_second_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = TwoSecondScore.get_global_high_score()
            is_new_record = global_high_score and two_second_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = TwoSecondScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_two_second_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        TwoSecondScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = TwoSecondScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_two_second_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = TwoSecondScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#5-second-cps
@login_required
def five_second_test(request):
    # Get global high score
    global_high_score = FiveSecondScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = FiveSecondScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        FiveSecondScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = FiveSecondScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = FiveSecondScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except FiveSecondScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/5seconds.html", context)

@login_required
def save_five_second_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            five_second_score = FiveSecondScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = FiveSecondScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=five_second_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = FiveSecondScore.get_global_high_score()
            is_new_record = global_high_score and five_second_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = FiveSecondScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_five_second_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        FiveSecondScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = FiveSecondScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_five_second_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = FiveSecondScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
#10-seocnd-cps
@login_required
def ten_second_cps_test(request):
    # Get global high score
    global_high_score = TenSecondCPSScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = TenSecondCPSScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        TenSecondCPSScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = TenSecondCPSScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = TenSecondCPSScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except TenSecondCPSScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/10seconds.html", context)

@login_required
def save_ten_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = TenSecondCPSScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = TenSecondCPSScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = TenSecondCPSScore.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = TenSecondCPSScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_ten_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        TenSecondCPSScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = TenSecondCPSScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_ten_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = TenSecondCPSScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

    
#15-second-cps-test
@login_required
def fifteen_second_cps_test(request):
    # Get global high score
    global_high_score = FifteenSecondCpsTest.get_global_high_score()
    
    # Get top player stats
    top_player_stats = FifteenSecondCpsTest.get_top_player_stats()
    
    # Get top 10 scores for leaderboard
    top_scores = (
        FifteenSecondCpsTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = FifteenSecondCpsTest.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = FifteenSecondCpsTest.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except FifteenSecondCpsTest.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/15seconds.html", context)


@login_required
def save_fifteen_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = FifteenSecondCpsTest.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = FifteenSecondCpsTest.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = FifteenSecondCpsTest.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = FifteenSecondCpsTest.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_fifteen_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        FifteenSecondCpsTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = FifteenSecondCpsTest.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_fifteen_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = FifteenSecondCpsTest.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#20-second-cps-test
@login_required
def twenty_second_cps_test(request):
    # Get global high score
    global_high_score = TwentySecondCPSTest.get_global_high_score()
    
    # Get top player stats
    top_player_stats = TwentySecondCPSTest.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        TwentySecondCPSTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = TwentySecondCPSTest.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = TwentySecondCPSTest.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except TwentySecondCPSTest.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/20seconds.html", context)

@login_required
def save_twenty_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = TwentySecondCPSTest.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = TwentySecondCPSTest.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = TwentySecondCPSTest.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = TwentySecondCPSTest.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_twenty_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        TwentySecondCPSTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = TwentySecondCPSTest.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_twenty_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = TwentySecondCPSTest.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#30-second-cps-test

@login_required
def thirty_second_cps_test(request):
    # Get global high score
    global_high_score = ThirtySecondCPSTest.get_global_high_score()
    
    # Get top player stats
    top_player_stats = ThirtySecondCPSTest.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        ThirtySecondCPSTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = ThirtySecondCPSTest.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = ThirtySecondCPSTest.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except ThirtySecondCPSTest.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/30seconds.html", context)


@login_required
def save_thirty_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = ThirtySecondCPSTest.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = ThirtySecondCPSTest.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = ThirtySecondCPSTest.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = ThirtySecondCPSTest.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_thirty_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        ThirtySecondCPSTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = ThirtySecondCPSTest.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_thirty_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = ThirtySecondCPSTest.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
    
#60-second-cps-test
@login_required
def sixty_second_cps_test(request):
    # Get global high score
    global_high_score = SixtySecondsCPSTest.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SixtySecondsCPSTest.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SixtySecondsCPSTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SixtySecondsCPSTest.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SixtySecondsCPSTest.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SixtySecondsCPSTest.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/60seconds.html", context)


@login_required
def save_sixty_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = SixtySecondsCPSTest.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SixtySecondsCPSTest.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SixtySecondsCPSTest.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SixtySecondsCPSTest.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_sixty_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SixtySecondsCPSTest.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = SixtySecondsCPSTest.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_sixty_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SixtySecondsCPSTest.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#100-second-cps-test
@login_required
def hundred_second_cps_test(request):
    # Get global high score
    global_high_score = HundredSecondCpsScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = HundredSecondCpsScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's full name and username
    top_scores = (
        HundredSecondCpsScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = HundredSecondCpsScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = HundredSecondCpsScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except HundredSecondCpsScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "cps/100seconds.html", context)


@login_required
def save_hundred_second_cps_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            cps_score = HundredSecondCpsScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = HundredSecondCpsScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=cps_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = HundredSecondCpsScore.get_global_high_score()
            is_new_record = global_high_score and cps_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = HundredSecondCpsScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_hundred_second_cps_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        HundredSecondCpsScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = HundredSecondCpsScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_hundred_second_cps_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = HundredSecondCpsScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#reaction-time-test

# Reaction Time Test
@login_required
def reaction_time_test(request):
    # Get global best time
    global_best_time = ReactionTimeScore.get_global_best_time()
    
    # Get top player stats
    top_player_stats = ReactionTimeScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard
    top_scores = (
        ReactionTimeScore.objects
        .all()
        .order_by('score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best time if logged in
    user_best_time = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_time = ReactionTimeScore.objects.filter(
                user=request.user
            ).order_by('score').first()
            
            # Calculate user's rank
            if user_best_time:
                user_rank = ReactionTimeScore.objects.filter(
                    score__lt=user_best_time.score
                ).count() + 1
        except ReactionTimeScore.DoesNotExist:
            pass
    
    context = {
        'global_best_time': global_best_time,
        'top_player_stats': top_player_stats,
        'user_best_time': user_best_time,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "reaction_time.html", context)

@login_required
def save_reaction_time_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))  # Reaction time in ms
            attempts = int(data.get('attempts'))
            
            # Save the score
            reaction_time_score = ReactionTimeScore.objects.create(
                user=request.user,
                score=score,
                attempts=attempts
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = ReactionTimeScore.objects.filter(
                Q(score__lt=score) | Q(score=score, created_at__lt=reaction_time_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_best_time = ReactionTimeScore.get_global_best_time()
            is_new_record = global_best_time and reaction_time_score.score < global_best_time.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = ReactionTimeScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_reaction_time_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        ReactionTimeScore.objects
        .all()
        .order_by('score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = ReactionTimeScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_reaction_time_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = ReactionTimeScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

# Butterfly/Kohi test
@login_required
def butterfly_click_test(request):
    # Get global high score
    global_high_score = ButterflyScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = ButterflyScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's full name and username
    top_scores = (
        ButterflyScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = ButterflyScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = ButterflyScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except ButterflyScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "butterfly.html", context)


@login_required
def save_butterfly_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            clicks = int(data.get('clicks'))
            
            # Save the score
            butterfly_score = ButterflyScore.objects.create(
                user=request.user,
                score=score,
                clicks=clicks
            )
            
            # ✅ Calculate rank (same score → earlier created_at wins)
            user_rank = ButterflyScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=butterfly_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = ButterflyScore.get_global_high_score()
            is_new_record = global_high_score and butterfly_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = ButterflyScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_butterfly_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        ButterflyScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = ButterflyScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_butterfly_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = ButterflyScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#spacebar-counter

@login_required
def spacebar_counter(request):
    # Get global high score
    global_high_score = SpacebarScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard
    top_scores = (
        SpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/spacebar_counter.html", context)


@login_required
def save_spacebar_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_spacebar_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })


def get_spacebar_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#one-second-spacebar-counter

@login_required
def one_second_spacebar_counter(request):
    # Get global high score
    global_high_score = OneSecondSpacebarScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = OneSecondSpacebarScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        OneSecondSpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = OneSecondSpacebarScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = OneSecondSpacebarScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except OneSecondSpacebarScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/1second.html", context)

@login_required
def save_one_second_spacebar_results(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            
            # Save the score
            spacebar_score = OneSecondSpacebarScore.objects.create(
                user=request.user,
                score=score
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = OneSecondSpacebarScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = OneSecondSpacebarScore.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = OneSecondSpacebarScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_one_second_spacebar_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        OneSecondSpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = OneSecondSpacebarScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_one_second_spacebar_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = OneSecondSpacebarScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
    
#2-second-spacebar-counter

@login_required
def two_second_spacebar_counter(request):
    # Get global high score
    global_high_score = TwoSecondSpacebarScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = TwoSecondSpacebarScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        TwoSecondSpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = TwoSecondSpacebarScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = TwoSecondSpacebarScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except TwoSecondSpacebarScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/2seconds.html", context)


@login_required
def save_two_second_spacebar_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = TwoSecondSpacebarScore.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = TwoSecondSpacebarScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = TwoSecondSpacebarScore.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = TwoSecondSpacebarScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_two_second_spacebar_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        TwoSecondSpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = TwoSecondSpacebarScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_two_second_spacebar_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = TwoSecondSpacebarScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#5-second-spacebar-counter

@login_required
def five_second_spacebar_counter(request):
    # Get global high score
    global_high_score = FiveSecondSpacebarScore.get_global_high_score()
    
    # Get top player stats
    top_player_stats = FiveSecondSpacebarScore.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        FiveSecondSpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = FiveSecondSpacebarScore.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = FiveSecondSpacebarScore.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except FiveSecondSpacebarScore.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/5seconds.html", context)


@login_required
def save_five_second_spacebar_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = FiveSecondSpacebarScore.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = FiveSecondSpacebarScore.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = FiveSecondSpacebarScore.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = FiveSecondSpacebarScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_five_second_spacebar_leaderboard(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        FiveSecondSpacebarScore.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = FiveSecondSpacebarScore.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_five_second_spacebar_global_top_player(request):
    """API endpoint to get global top player stats"""
    top_player_stats = FiveSecondSpacebarScore.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
    
@login_required
def spacebar_counter10(request):
    # Get global high score
    global_high_score = SpacebarScore10.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore10.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SpacebarScore10.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore10.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore10.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore10.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/10seconds.html", context)

@login_required
def save_spacebar_score10(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore10.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore10.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore10.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore10.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_spacebar_leaderboard10(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore10.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore10.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_spacebar_global_top_player10(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore10.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#15-second-spacebar-counter
@login_required
def spacebar_counter15(request):
    # Get global high score
    global_high_score = SpacebarScore15.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore15.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SpacebarScore15.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore15.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore15.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore15.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/15seconds.html", context)


@login_required
def save_spacebar_score15(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore15.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore15.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore15.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore15.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_spacebar_leaderboard15(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore15.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore15.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_spacebar_global_top_player15(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore15.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#20-second-spacebar-counter

@login_required
def spacebar_counter20(request):
    # Get global high score
    global_high_score = SpacebarScore20.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore20.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SpacebarScore20.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore20.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore20.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore20.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/20seconds.html", context)

@login_required
def save_spacebar_score20(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore20.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore20.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore20.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore20.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_spacebar_leaderboard20(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore20.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore20.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_spacebar_global_top_player20(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore20.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })

#30-second-spacebar-score
@login_required
def spacebar_counter_30(request):
    # Get global high score
    global_high_score = SpacebarScore30.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore30.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SpacebarScore30.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore30.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore30.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore30.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/30seconds.html", context)


@login_required
def save_spacebar_score_30(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore30.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore30.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore30.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore30.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_spacebar_leaderboard_30(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore30.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore30.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_spacebar_global_top_player_30(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore30.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
    
#60-second-spacebar-ccounter
@login_required
def spacebar_counter_60(request):
    # Get global high score
    global_high_score = SpacebarScore60.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore60.get_top_player_stats()
    
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SpacebarScore60.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore60.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore60.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore60.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/60seconds.html", context)


@login_required
def save_spacebar_score_60(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = int(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore60.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore60.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore60.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore60.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_spacebar_leaderboard_60(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore60.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))  # The annotated field is named 'username'
        .values('username', 'score', 'created_at')  # Refer to the annotated field as 'username'
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore60.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_spacebar_global_top_player_60(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore60.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
    
#100-second-spacebar-counter
@login_required
def spacebar_counter_100(request):
    # Get global high score
    global_high_score = SpacebarScore100.get_global_high_score()
    
    # Get top player stats
    top_player_stats = SpacebarScore100.get_top_player_stats()
    
    # Get top 10 scores for leaderboard with user's username
    top_scores = (
        SpacebarScore100.objects
        .all()
        .order_by('-score')[:10]
        .annotate(
            username=models.F('user__username')
        )
    )
    
    # Get user's best score if logged in
    user_best_score = None
    user_rank = None
    
    if request.user.is_authenticated:
        try:
            user_best_score = SpacebarScore100.objects.filter(
                user=request.user
            ).order_by('-score').first()
            
            # Calculate user's rank
            if user_best_score:
                user_rank = SpacebarScore100.objects.filter(
                    score__gt=user_best_score.score
                ).count() + 1
        except SpacebarScore100.DoesNotExist:
            pass
    
    context = {
        'global_high_score': global_high_score,
        'top_player_stats': top_player_stats,
        'user_best_score': user_best_score,
        'user_rank': user_rank,
        'top_scores': top_scores,
    }
    
    return render(request, "spacebar/100seconds.html", context)


@login_required
def save_spacebar_score_100(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score = float(data.get('score'))
            presses = int(data.get('presses'))
            
            # Save the score
            spacebar_score = SpacebarScore100.objects.create(
                user=request.user,
                score=score,
                presses=presses
            )
            
            # Calculate rank (same score → earlier created_at wins)
            user_rank = SpacebarScore100.objects.filter(
                Q(score__gt=score) | Q(score=score, created_at__lt=spacebar_score.created_at)
            ).count() + 1
            
            # Check if this is a new world record
            global_high_score = SpacebarScore100.get_global_high_score()
            is_new_record = global_high_score and spacebar_score.score > global_high_score.score

            # Build full name into last_name
            full_name = f"{request.user.username} "
            
            # Get updated top player stats
            top_player_stats = SpacebarScore100.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'is_new_record': is_new_record,
                'new_record_user': full_name,
                'new_record_score': score,
                'user_rank': user_rank,
                'top_player_stats': top_player_stats
            })
            
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid data'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def get_spacebar_leaderboard_100(request):
    # Get top 10 scores with the user's username annotated as 'username'
    top_scores = (
        SpacebarScore100.objects
        .all()
        .order_by('-score')[:10]
        .annotate(username=F('user__username'))
        .values('username', 'score', 'created_at')
    )
    
    # Get top player stats
    top_player_stats = SpacebarScore100.get_top_player_stats()

    leaderboard_data = list(top_scores)
    
    return JsonResponse({
        'status': 'success',
        'leaderboard': leaderboard_data,
        'top_player_stats': top_player_stats
    })

def get_spacebar_global_top_player_100(request):
    """API endpoint to get global top player stats"""
    top_player_stats = SpacebarScore100.get_top_player_stats()
    
    if top_player_stats:
        return JsonResponse({
            'status': 'success',
            'top_player': top_player_stats
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'No top player found'
        })
    
#game
@csrf_exempt
@require_POST
def save_dinosaur_score(request):
    if request.user.is_authenticated:
        try:
            data = json.loads(request.body)
            score = data.get('score', 0)
            distance = data.get('distance', 0)
            obstacles_passed = data.get('obstacles_passed', 0)
            
            # Save the score
            dinosaur_score = DinosaurScore(
                user=request.user,
                score=score,
                distance=distance,
                obstacles_passed=obstacles_passed
            )
            dinosaur_score.save()
            
            # Get user's rank
            all_scores = list(DinosaurScore.objects.all().order_by('-score').values_list('id', flat=True))
            user_rank = all_scores.index(dinosaur_score.id) + 1 if dinosaur_score.id in all_scores else None
            
            # Get top player stats
            top_player_stats = DinosaurScore.get_top_player_stats()
            
            return JsonResponse({
                'status': 'success',
                'user_rank': user_rank,
                'top_player_stats': top_player_stats,
                'is_new_record': user_rank == 1 if user_rank else False
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'})

def get_dinosaur_leaderboard(request):
    try:
        # Get top 10 scores
        top_scores = DinosaurScore.objects.all().order_by('-score')[:10]
        
        leaderboard_data = []
        for score in top_scores:
            leaderboard_data.append({
                'username': score.user.username,
                'score': score.score,
                'distance': score.distance,
                'obstacles_passed': score.obstacles_passed,
                'created_at': score.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        # Get top player stats
        top_player_stats = DinosaurScore.get_top_player_stats()
        
        return JsonResponse({
            'status': 'success',
            'leaderboard': leaderboard_data,
            'top_player_stats': top_player_stats
        })
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})