from rest_framework.response import Response
from django.conf import settings
def set_auth_cookies(response, access, refresh):
    response.set_cookie(
        key="access_token", value=access, httponly=True, secure=settings.COOKIE_SECURE, samesite=settings.COOKIE_SAMESITE,path="/",
    )

    response.set_cookie(
        key="refresh_token", value=refresh, httponly=True, secure=settings.COOKIE_SECURE, samesite=settings.COOKIE_SAMESITE,path="/"
    )

    return response