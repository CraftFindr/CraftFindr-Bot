from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers, status
from api.models import User
from .serializers import ServiceCategorySerializer

class UserListAPI(APIView):
    class OutPutSerializer(serializers.ModelSerializer):
        service_categories = ServiceCategorySerializer(many=True, read_only=True)
        class Meta:
            model = User
            fields = ['telegram_id',  'username', 'bio', 'rating', 'service_categories', 'is_artisan']

    def get(self, request):
        artisans = User.objects.all()
        serializer = self.OutPutSerializer(artisans, many=True)
        return Response(serializer.data)
    
class ArtisanListApi(APIView):
    class OutPutSerializer(serializers.ModelSerializer):
        service_categories = ServiceCategorySerializer(many=True, read_only=True)
        class Meta:
            model = User
            fields = ['telegram_id',  'username', 'bio', 'rating', 'service_categories', 'is_artisan']

    def get(self, request):
        artisans = User.objects.filter(is_artisan=True).all()
        serializer = self.OutPutSerializer(artisans, many=True)
        return Response(serializer.data)

class UserCreateView(APIView):
    class InputSerializer(serializers.Serializer):
        telegram_id = serializers.IntegerField()
        username = serializers.CharField(max_length=150)
        password = serializers.CharField(write_only=True, max_length=128)
        first_name = serializers.CharField(max_length=150, required=False)
        last_name = serializers.CharField(max_length=150, required=False)
        is_artisan = serializers.BooleanField(required=False)
        class Meta: 
            model = User
            fields = ['telegram_id', 'username', 'password', 'first_name', 'last_name', 'is_artisan']
            extra_kwargs = {
                'password': {'write_only': True}
            }
        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user 
        
    def get(self, request):
        return Response("Enter username, telegram_id and password to register", status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        serializer = self.InputSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(self.InputSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)