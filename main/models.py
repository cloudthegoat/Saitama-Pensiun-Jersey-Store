import uuid
from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    CATEGORY_CHOICES = [
        ('jersey premier league', 'Jersey Premier League'),
        ('jersey laliga', 'Jersey LALIGA'),
        ('jersey serie a', 'Jersey Serie A'),
        ('jersey bundesliga', 'Jersey Bundesliga'),
        ('jersey ligue 1', 'Jersey Ligue 1'),
        ('jersey timnas indonesia', 'Jersey Timnas Indonesia'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    price = models.IntegerField()
    description = models.TextField()
    thumbnail = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='jersey premier league')
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)