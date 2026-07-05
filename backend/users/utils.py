from rest_framework.response import Response

def set_auth_cookies(response, access, refresh):
    response.set_cookie(
        key="access_token", value=access, httponly=True, secure=False, samesite="Lax",
    )

    response.set_cookie(
        key="refresh_token", value=access, httponly=True, secure=False, samesite="Lax",
    )

    return response