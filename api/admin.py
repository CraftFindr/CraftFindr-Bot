from django.contrib import admin
from api.models import ArtisanServices, Artisan, Orders

admin.site.register(Artisan)
admin.site.register(ArtisanServices)
admin.site.register(Orders)