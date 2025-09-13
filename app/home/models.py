# models.py
from django.db import models
from django.conf import settings
from django.db.models import Avg, Max, Min, Count, Q, F
from django.db.models.functions import Concat
from django.db.models import Value

class JitterScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None
        
class CPSScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class OneSecondScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None
    
class TwoSecondScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class FiveSecondScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class TenSecondCPSScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class FifteenSecondCpsTest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class TwentySecondCPSTest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None


class ThirtySecondCPSTest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class SixtySecondsCPSTest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class HundredSecondCpsScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class ReactionTimeScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()  # Reaction time in milliseconds
    attempts = models.IntegerField()  # Number of attempts in the test
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['score']  # Order by best (lowest) times first

    def __str__(self):
        return f"{self.user.username}: {self.score} ms"
    
    @classmethod
    def get_global_best_time(cls):
        """Returns the best (lowest) time across all users"""
        try:
            return cls.objects.all().order_by('score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'attempts': top_player.attempts,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class ButterflyScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    clicks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} CPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'clicks': top_player.clicks,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class SpacebarScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    presses = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} PPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class OneSecondSpacebarScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Number of spacebar presses
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class TwoSecondSpacebarScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Total presses in 2 seconds
    presses = models.IntegerField()  # Same as score, for consistency with original
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 2, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None
    
class FiveSecondSpacebarScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    presses = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} PPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 5, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class SpacebarScore10(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Total presses in 10 seconds
    presses = models.IntegerField()  # Same as score, for consistency with clicks
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} Presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 10, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class SpacebarScore15(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Total presses in 15 seconds
    presses = models.IntegerField()  # Same as score, for consistency with jitter test
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 15, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class SpacebarScore20(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Total presses in 20 seconds
    presses = models.IntegerField()  # Same as score, kept for consistency
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} Presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 20, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None

class SpacebarScore30(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Total presses in 30 seconds
    presses = models.IntegerField()  # Same as score, for consistency
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 30, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None
        
class SpacebarScore60(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()  # Total presses in 60 seconds
    presses = models.IntegerField()  # Same as score, for consistency
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} presses"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 60, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None
        
class SpacebarScore100(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    presses = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} PPS"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': round(top_player.score / 100, 2),
                    'presses': top_player.presses,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None
        
class DinosaurScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()
    distance = models.IntegerField()  # Distance traveled
    obstacles_passed = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score']  # Order by best scores first

    def __str__(self):
        return f"{self.user.username}: {self.score} points"
    
    @classmethod
    def get_global_high_score(cls):
        """Returns the highest score across all users"""
        try:
            return cls.objects.all().order_by('-score').first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_top_player_stats(cls):
        """Returns stats for the global #1 player"""
        try:
            top_player = cls.objects.all().order_by('-score').first()
            if top_player:
                return {
                    'name': top_player.user.username,
                    'score': top_player.score,
                    'distance': top_player.distance,
                    'obstacles_passed': top_player.obstacles_passed,
                    'position': 1
                }
            return None
        except cls.DoesNotExist:
            return None


