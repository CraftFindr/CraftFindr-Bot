from django.urls import path
from .views import ArtisanListApi, UserCreateView, UserListAPI

urlpatterns = [
   path('users/', UserListAPI.as_view(), name='user-list'),
   path('artisans/', ArtisanListApi.as_view(), name='artisan-list'),
   path('create-user/', UserCreateView.as_view(), name='user-create')
]


