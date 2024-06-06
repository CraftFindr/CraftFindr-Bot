from django.contrib import admin
from api.models import User, ArtisanProfile, ServiceCategory

admin.site.register(User)
admin.site.register(ArtisanProfile)
admin.site.register(ServiceCategory)