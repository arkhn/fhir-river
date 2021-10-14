from django.conf import settings

import requests


def logout(request):
    """When logging out of river, the session is destroyed in the river app
    but we also need to destroy the session in oprovider, otherwise the client
    will simply silently re-login. We therefore call the logout route of oprovider.
    See https://mozilla-django-oidc.readthedocs.io/en/stable/installation.html
    log-user-out-of-the-openid-connect-provider
    https://mozilla-django-oidc.readthedocs.io/en/stable/settings.html#OIDC_OP_LOGOUT_URL_METHOD
    https://django-oauth-toolkit.readthedocs.io/en/1.4.0/tutorial/tutorial_04.html?highlight=revoke#setup-a-request

    Therefore the process is: call the `OIDC_OP_LOGOUT_ENDPOINT` route to invalidate
    the access token and then remove the user from the oprovider session by redirecting
    the browser to `LOGOUT_REDIRECT_URL`.
        Args:
            request ([WSGIRequest]): the user request

        Returns:
            [str]: the URL to which the user should be redirected
    """
    access_token = request.session.get("oidc_access_token")
    requests.post(
        settings.OIDC_OP_LOGOUT_ENDPOINT,
        data={
            "token": access_token,
            "client_id": settings.OIDC_RP_CLIENT_ID,
            "client_secret": settings.OIDC_RP_CLIENT_SECRET,
        },
    )

    return settings.LOGOUT_REDIRECT_URL
