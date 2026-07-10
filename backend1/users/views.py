from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (LoginSerializer, RegisterSerializer, UserSerializer,)
from .utils import set_auth_cookies
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
# Create your views here.

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Account created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password,)
        if user is None:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        response = Response(
            {"message": "Login successful", "user": UserSerializer(user).data,}
        )

        set_auth_cookies(response, str(refresh.access_token), str(refresh),)

        return response

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response(
            {"message": "Logged out successfully"}
        )
        response.delete_cookie("access_token", path="/", samesite=settings.COOKIE_SAMESITE,)
        response.delete_cookie("refresh_token", path="/", samesite=settings.COOKIE_SAMESITE,)

        return response

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response(serializer.data)

class RefreshTokenView(APIView):
    print("refresh view reached")
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(refresh_token)
            from rest_framework_simplejwt.settings import api_settings
            if api_settings.ROTATE_REFRESH_TOKENS:
                if api_settings.BLACKLIST_AFTER_ROTATION:
                    try:
                        refresh.blacklist()
                    except AttributeError:
                        pass
                refresh.set_jti()
                refresh.set_exp()
                refresh.set_iat()
                new_refresh = str(refresh)
            else:
                new_refresh = refresh_token

            access_token = str(refresh.access_token)
            response = Response(
                {"message": "Token refreshed"}
            )
            set_auth_cookies(response, access_token, new_refresh)
            return response

        except TokenError:
            response = Response(
                {"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie("refresh_token", path="/", samesite=settings.COOKIE_SAMESITE)
            response.delete_cookie("access_token", path="/", samesite=settings.COOKIE_SAMESITE)
            return response