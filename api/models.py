from django.db import models
from django.contrib.auth.models import AbstractUser

class Artisan(AbstractUser):
   phone_number = models.CharField(max_length=15)

class ArtisanServices(models.Model):
    id = models.AutoField(primary_key=True)
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE, related_name='services_offered')
    service = models.CharField(max_length=100)

class Orders(models.Model):
   order_id = models.AutoField(primary_key=True)
   artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE, related_name='orders')
   order = models.CharField(max_length=100)
   service = models.CharField(max_length=100)
   date = models.DateField()

   # time should be in 24 hour format
   time = models.CharField(max_length=100) 

   # status should be one of the following: booked, completed or cancelled
   status = models.CharField(max_length=100)

   # this says whether or not the order is from "others" input field when customer wants a service that's not on the list provided.
   is_special_order = models.BooleanField(default=False)
   