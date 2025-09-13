from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='home' ),
    path('dpi-analyzer/', views.mouse_dpi_analyzer, name='mouse_dpi_analyzer' ),
    path('mouse-test/', views.mouse_test , name='mouse_test' ),
    path('keyboard-test/', views.keyboard_test , name='keyboard_test' ),
    path('dinosaur-game/', views.game , name='dinosaur_game' ),
    path('sensitivity-converter/', views.sensitivity_converter , name='sensitivity_converter' ),
    path('polling-rate-tester/', views.polling_rate_tester , name='polling_rate_tester' ),
    path('edpi-calculator/', views.edpi_calculator , name='edpi_calculator' ),
    #jitter-test
    path('jitter-click-test/', views.jitter_click_test, name='jitter_click_test'),
    path('save-jitter-score/', views.save_jitter_score, name='save_jitter_score'),
    path('get-jitter-leaderboard/', views.get_jitter_leaderboard, name='get_jitter_leaderboard'),
    path('get-jitter-global-top-player/', views.get_jitter_global_top_player, name='get_jitter_global_top_player'),
    #cps-test
    path('cps-test/', views.cps_test, name='cps_test'),
    path('save-cps-score/', views.save_cps_score, name='save_cps_score'),
    path('get-cps-leaderboard/', views.get_cps_leaderboard, name='get_cps_leaderboard'),
    path('get-cps-global-top-player/', views.get_cps_global_top_player, name='get_cps_global_top_player'),
    #1-second-cps-test
    path('1-second-cps-test/', views.one_second_cps_test, name='1_second_mouse_cps_test'),
    path('save-one-second-cps-score/', views.save_one_second_cps_score, name='save_one_second_cps_score'),
    path('get-one-second-cps-leaderboard/', views.get_one_second_cps_leaderboard, name='get_one_second_cps_leaderboard'),
    path('get-one-second-cps-global-top-player/', views.get_one_second_cps_global_top_player, name='get_one_second_cps_global_top_player'),

    #2-second-cps-test
    path('2-second-cps-test/', views.two_second_test, name='2_seconds_mouse_cps_test'),
    path('save-2-second-score/', views.save_two_second_score, name='save_two_second_score'),
    path('get-2-second-leaderboard/', views.get_two_second_leaderboard, name='get_two_second_leaderboard'),
    path('get-2-second-global-top-player/', views.get_two_second_global_top_player, name='get_two_second_global_top_player'),
    #5-second-sps-test
    path('5-second-cps-test/', views.five_second_test, name='5_seconds_mouse_cps_test'),
    path('save-5-second-score/', views.save_five_second_score, name='save_five_second_score'),
    path('get-5-second-leaderboard/', views.get_five_second_leaderboard, name='get_five_second_leaderboard'),
    path('get-5-second-global-top-player/', views.get_five_second_global_top_player, name='get_five_second_global_top_player'),
    #10-second-cps-test
    path('10-second-cps-test/', views.ten_second_cps_test, name='10_seconds_mouse_cps_test'),
    path('save-10-second-score/', views.save_ten_second_cps_score, name='save_ten_second_cps_score'),
    path('get-10-second-leaderboard/', views.get_ten_second_cps_leaderboard, name='get_ten_second_cps_leaderboard'),
    path('get-10-second-cps-global-top-player/', views.get_ten_second_cps_global_top_player, name='get_ten_second_cps_global_top_player'),
    #15-second-cps-test
    path('15-second-cps-test/', views.fifteen_second_cps_test, name='15_seconds_mouse_cps_test'),
    path('save-15-second-cps-score/', views.save_fifteen_second_cps_score, name='save_15_second_cps_score'),
    path('get-15second-cps-leaderboard/', views.get_fifteen_second_cps_leaderboard, name='get_15_second_cps_leaderboard'),
    path('get-15-second-cps-global-top-player/', views.get_fifteen_second_cps_global_top_player, name='get_15_second_cps_global_top_player'),
    #20-second-cps-test
    path('20-second-cps-test/', views.twenty_second_cps_test, name='20_seconds_mouse_cps_test'),
    path('save-20-second-cps-score/', views.save_twenty_second_cps_score, name='save_twenty_second_cps_score'),
    path('get-20-second-cps-leaderboard/', views.get_twenty_second_cps_leaderboard, name='get_twenty_second_cps_leaderboard'),
    path('get-twenty-second-cps-global-top-player/', views.get_twenty_second_cps_global_top_player, name='get_twenty_second_cps_global_top_player'),
    #30-second-cps-test
    path('30-second-cps-test/', views.thirty_second_cps_test, name='30_seconds_mouse_cps_test'),
    path('save-30-second-cps-score/', views.save_thirty_second_cps_score, name='save_thirty_second_cps_score'),
    path('get-30-seocnd-cps-leaderboard/', views.get_thirty_second_cps_leaderboard, name='get_thirty_second_cps_leaderboard'),
    path('get-30-seocnd-cps-global-top-player/', views.get_thirty_second_cps_global_top_player, name='get_thirty_second_cps_global_top_player'),
    #60-second-cps-test
    path('60-second-cps-test/', views.sixty_second_cps_test, name='60_seconds_mouse_cps_test'),
    path('save-60-second-cps-score/', views.save_sixty_second_cps_score, name='save_sixty_second_cps_score'),
    path('get-60-second-cps-leaderboard/', views.get_sixty_second_cps_leaderboard, name='get_sixty_second_cps_leaderboard'),
    path('get-60-second-cps-global-top-player/', views.get_sixty_second_cps_global_top_player, name='get_sixty_second_cps_global_top_player'), 
    #100-second-cps-score
    path('100-second-cps-test/', views.hundred_second_cps_test, name='100_seconds_mouse_cps_test'),
    path('save-100-second-cps-score/', views.save_hundred_second_cps_score, name='save_hundred_second_cps_score'),
    path('get-100-second-cps-leaderboard/', views.get_hundred_second_cps_leaderboard, name='get_hundred_second_cps_leaderboard'),
    path('get-100-second-cps-global-top-player/', views.get_hundred_second_cps_global_top_player, name='get_cps_global_top_player'),
    # Reaction-Time-Test
    path('reaction-time-test/', views.reaction_time_test, name='reaction_time_test'),
    path('save-reaction-time-score/', views.save_reaction_time_score, name='save_reaction_time_score'),
    path('get-reaction-time-leaderboard/', views.get_reaction_time_leaderboard, name='get_reaction_time_leaderboard'),
    path('get-reaction-time-global-top-player/', views.get_reaction_time_global_top_player, name='get_reaction_time_global_top_player'),
     # Butterfly/Kohi test
    path('butterfly-click-test/', views.butterfly_click_test, name='butterfly_click_test'),
    path('save-butterfly-score/', views.save_butterfly_score, name='save_butterfly_score'),
    path('get-butterfly-leaderboard/', views.get_butterfly_leaderboard, name='get_butterfly_leaderboard'),
    path('get-butterfly-global-top-player/', views.get_butterfly_global_top_player, name='get_butterfly_global_top_player'),
    # Spacebar counter
    path('spacebar-counter/', views.spacebar_counter, name='spacebar_counter'),
    path('save-spacebar-score/', views.save_spacebar_score, name='save_spacebar_score'),
    path('get-spacebar-leaderboard/', views.get_spacebar_leaderboard, name='get_spacebar_leaderboard'),
    path('get-spacebar-global-top-player/', views.get_spacebar_global_top_player, name='get_spacebar_global_top_player'),
    #1-second-spacebar-counter
    path('1-second-spacebar-counter/', views.one_second_spacebar_counter, name='1_second_spacebar_counter'),
    path('save-1-second-spacebar-score/', views.save_one_second_spacebar_results, name='save_1_second_spacebar_score'),
    path('get-1-second-spacebar-leaderboard/', views.get_one_second_spacebar_leaderboard, name='get_one_second_spacebar_leaderboard'),
    path('get-1-second-spacebar-global-top-player/', views.get_one_second_spacebar_global_top_player, name='get_one_second_spacebar_global_top_player'),
    #2-second-spacebar-counter
    path('2-second-spacebar-counter/', views.two_second_spacebar_counter, name='2_seconds_spacebar_counter'),
    path('save-spacebar-score-2/', views.save_two_second_spacebar_score, name='save_2_second_spacebar_score'),
    path('get-spacebar-leaderboard-2/', views.get_two_second_spacebar_leaderboard, name='get_2_second_spacebar_leaderboard'),
    path('get-spacebar-global-top-player-2/', views.get_two_second_spacebar_global_top_player, name='get_2_second_spacebar_global_top_player'),
    #5-second-spacebar
    path('5-second-spacebar-counter/', views.five_second_spacebar_counter, name='5_seconds_spacebar_counter'),
    path('save-spacebar-score-5/', views.save_five_second_spacebar_score, name='save_5_second_spacebar_score'),
    path('get-spacebar-leaderboard-5/', views.get_five_second_spacebar_leaderboard, name='get_5_second_spacebar_leaderboard'),
    path('get-spacebar-global-top-player-5/', views.get_five_second_spacebar_global_top_player, name='get_5_second_spacebar_global_top_player'),
    #10-second-spacebar-counter
    path('10-second-spacebar-counter/', views.spacebar_counter10, name='10_seconds_spacebar_counter'),
    path('save-spacebar-score10/', views.save_spacebar_score10, name='save_spacebar_score10'),
    path('get-spacebar-leaderboard10/', views.get_spacebar_leaderboard10, name='get_spacebar_leaderboard10'),
    path('get-spacebar-global-top-player10/', views.get_spacebar_global_top_player10, name='get_spacebar_global_top_player10'),
    #15-second-spacebar-counter
    path('15-second-spacebar-counter/', views.spacebar_counter15, name='15_seconds_spacebar_counter'),
    path('save-spacebar-score15/', views.save_spacebar_score15, name='save_spacebar_score15'),
    path('get-spacebar-leaderboard15/', views.get_spacebar_leaderboard15, name='get_spacebar_leaderboard15'),
    path('get-spacebar-global-top-player15/', views.get_spacebar_global_top_player15, name='get_spacebar_global_top_player15'),
    #20-second-spacebar-counter
    path('20-second-spacebar-counter/', views.spacebar_counter20, name='20_seconds_spacebar_counter'),
    path('save-spacebar-score20/', views.save_spacebar_score20, name='save_spacebar_score20'),
    path('get-spacebar-leaderboard20/', views.get_spacebar_leaderboard20, name='get_spacebar_leaderboard20'),
    path('get-spacebar-global-top-player20/', views.get_spacebar_global_top_player20, name='get_spacebar_global_top_player20'),
    #30-second-spacebar-counter
    path('30-second-spacebar-counter/', views.spacebar_counter_30, name='30_seconds_spacebar_counter'),
    path('save-spacebar-score-30/', views.save_spacebar_score_30, name='save_spacebar_score_30'),
    path('get-spacebar-leaderboard-30/', views.get_spacebar_leaderboard_30, name='get_spacebar_leaderboard_30'),
    path('get-spacebar-global-top-player-30/', views.get_spacebar_global_top_player_30, name='get_spacebar_global_top_player_30'),
    #60-second-spacebar-counter
    path('60-second-spacebar-counter/', views.spacebar_counter_60, name='60_seconds_spacebar_counter'),
    path('save-spacebar-score-60/', views.save_spacebar_score_60, name='save_spacebar_score_60'),
    path('get-spacebar-leaderboard-60/', views.get_spacebar_leaderboard_60, name='get_spacebar_leaderboard_60'),
    path('get-spacebar-global-top-player-60/', views.get_spacebar_global_top_player_60, name='get_spacebar_global_top_player_60'),
    #100-second-spacebar-counter
    path('100-second-spacebar-counter/', views.spacebar_counter_100, name='100_seconds_spacebar_counter'),
    path('save-spacebar-score-100/', views.save_spacebar_score_100, name='save_spacebar_score_100'),
    path('get-spacebar-leaderboard-100/', views.get_spacebar_leaderboard_100, name='get_spacebar_leaderboard_100'),
    path('get-spacebar-global-top-player-100/', views.get_spacebar_global_top_player_100, name='get_spacebar_global_top_player_100'),
    #dinosaur-game
    path('save-dinosaur-score/', views.save_dinosaur_score, name='save_dinosaur_score'),
    path('get-dinosaur-leaderboard/', views.get_dinosaur_leaderboard, name='get_dinosaur_leaderboard'),
]
