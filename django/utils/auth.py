from django.conf import settings


# When logging out of river, the session is destroyed in the river app
# but we also need to destroy he session in oprovider, otherwise the client
# will simply silently re-login. We therefore call the logout route of oprovider.
# See https://mozilla-django-oidc.readthedocs.io/en/stable/installation.html
# #log-user-out-of-the-openid-connect-provider
# https://mozilla-django-oidc.readthedocs.io/en/stable/settings.html#OIDC_OP_LOGOUT_URL_METHOD
def logout(request):
    return settings.OIDC_OP_LOGOUT_ENDPOINT
