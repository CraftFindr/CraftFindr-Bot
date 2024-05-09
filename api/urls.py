from django.urls import path
from .views import ArtisanListApi

urlpatterns = [
   path('artisan/list', ArtisanListApi.as_view()),
]


