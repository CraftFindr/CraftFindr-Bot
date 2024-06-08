from django.utils import timezone
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
class UserManager(BaseUserManager):
    def create_user(self, telegram_id, username=None, password=None, **extra_fields):
        if not telegram_id:
            raise ValueError("The Telegram ID must be set")
        user = self.model(telegram_id=telegram_id, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(
        self, telegram_id, username=None, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(telegram_id, username, password, **extra_fields)
    
class User(AbstractBaseUser, PermissionsMixin): 
    telegram_id = models.IntegerField(unique=True)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    username = models.CharField(max_length=150, null=True, blank=True)
    is_artisan = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    bio = models.TextField(null=True, blank=True)
    rating = models.FloatField(default=0)
    objects = UserManager()
    USERNAME_FIELD = "telegram_id"
    REQUIRED_FIELDS = ["username"]
    def __str__(self):
        return self.username or str(self.telegram_id)

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]
    customer = models.ForeignKey(
        User, related_name="service_requests", on_delete=models.CASCADE
    )
    artisan = models.ForeignKey(
        User,
        related_name="assigned_requests",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Request {self.id} by {self.customer.username}"
class Chat(models.Model):
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Chat for request {self.service_request.id}"
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    message_id = models.BigIntegerField()
    text = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField()
    def __str__(self):
        return f"Message {self.message_id} in chat {self.chat.id}"