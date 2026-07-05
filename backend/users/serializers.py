from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User

        fields = (
            "username", "first_name", "last_name", "email", "password",
        )
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "id", "username", "first_name", "last_name", "email", "is_admin",
        )