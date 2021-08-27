from django.conf import settings


def logout(request):
    return settings.OIDC_OP_LOGOUT_ENDPOINT
