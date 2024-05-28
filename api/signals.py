from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ArtisanProfile
@receiver(post_save, sender=User)
def create_artisan_profile(sender, instance, created, **kwargs):
    if created and instance.is_artisan:
        ArtisanProfile.objects.create(user=instance)