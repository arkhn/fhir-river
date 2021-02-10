import json
import logging
import time

from mozilla_django_oidc.utils import import_from_settings
from mozilla_django_oidc.middleware import SessionRefresh
import requests

LOGGER = logging.getLogger(__name__)


class RefreshOIDCAccessToken(SessionRefresh):
    """
    A middleware that will refresh the access token following proper OIDC protocol:
    https://auth0.com/docs/tokens/refresh-token/current
    """
    def is_expired(self, request):
        if not self.is_refreshable_url(request):
            LOGGER.debug('request is not refreshable')
            return False

        expiration = request.session.get('oidc_id_token_expiration', 0)
        now = time.time()
        if expiration > now:
            # The id_token is still valid, so we don't have to do anything.
            LOGGER.debug('id token is still valid (%s > %s)', expiration, now)
            return False

        return True

    def process_request(self, request):
        if not self.is_expired(request):
            return

        LOGGER.debug('id token has expired')
        token_url = import_from_settings('OIDC_OP_TOKEN_ENDPOINT')
        client_id = import_from_settings('OIDC_RP_CLIENT_ID')
        client_secret = import_from_settings('OIDC_RP_CLIENT_SECRET')
        refresh_token = request.session.get('oidc_refresh_token')
        if not refresh_token:
            LOGGER.debug('no refresh token stored')
            return

        token_payload = {
            'grant_type': 'refresh_token',
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
        }

        try:
            response = requests.post(
                token_url,
                data=token_payload,
                verify=import_from_settings('OIDC_VERIFY_SSL', True)
            )
            response.raise_for_status()
            token_info = response.json()
        except requests.exceptions.Timeout:
            LOGGER.debug('timed out refreshing access token')
            return
        except requests.exceptions.HTTPError as exc:
            LOGGER.debug('http error %s when refreshing access token',
                         exc.response.status_code)
            return
        except json.JSONDecodeError:
            LOGGER.debug('malformed response when refreshing access token')
            return
        except Exception as exc:
            LOGGER.debug('unknown error occurred when refreshing access token: %s', exc)
            return

        # Until we can properly validate an ID token on the refresh response
        # per the spec[1], we intentionally drop the id_token.
        # [1]: https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokenResponse
        refresh_token = token_info.get('refresh_token')
        # Store the refresh token
        request.session['oidc_refresh_token'] = refresh_token
