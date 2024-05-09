from django.contrib import admin
from api.models import Service, Artisan, Order

admin.site.register(Artisan)
admin.site.register(Service)
admin.site.register(Order)