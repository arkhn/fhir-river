import logging

from django.core.exceptions import SuspiciousOperation
from django.urls import reverse
from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from mozilla_django_oidc.utils import absolutify

LOGGER = logging.getLogger(__name__)


class ApiOIDCAuthenticationBackend(OIDCAuthenticationBackend):
    def authenticate(self, request, **kwargs):
        """Authenticates a user based on the OIDC code flow."""
        if not request:
            return None

        state = request.GET.get('state')
        code = request.GET.get('code')
        nonce = kwargs.pop('nonce', None)

        if not code or not state:
            return None

        reverse_url = self.get_settings('OIDC_AUTHENTICATION_CALLBACK_URL',
                                        'oidc_authentication_callback')

        token_payload = {
            'client_id': self.OIDC_RP_CLIENT_ID,
            'client_secret': self.OIDC_RP_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': absolutify(
                request,
                reverse(reverse_url)
            ),
        }

        token_info = self.get_token(token_payload)
        id_token = token_info.get('id_token')
        access_token = token_info.get('access_token')
        # Get the refresh token
        refresh_token = token_info.get('refresh_token')

        payload = self.verify_token(id_token, nonce=nonce)
        if payload:
            # Store the refresh token
            request.session['oidc_refresh_token'] = refresh_token
            try:
                return self.get_or_create_user(access_token, id_token, payload)
            except SuspiciousOperation as exc:
                LOGGER.warning('failed to get or create user: %s', exc)
                return None

        return None
