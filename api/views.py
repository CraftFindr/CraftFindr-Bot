from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from api.models import Artisan

class ArtisanListApi(APIView):
   class OutPutSerializer(serializers.Serializer):
      username = serializers.CharField(max_length=100)
      # services_offered = serializers.CharField(max_length=100)
      phone_number = serializers.CharField(max_length=15)

# extract this into a selector later
   def get(self, request):
      artisans = self.OutPutSerializer(Artisan.objects.all(), many=True)
      return Response(artisans.data)
