from .base import *

# TODO: Requests should be authenticated. The following is a temporary workaround that
#   will be removed once authencation is setup globally.
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = ["rest_framework.permissions.AllowAny"]

# https://docs.djangoproject.com/en/3.2/ref/settings/#use-x-forwarded-host
# Behind a proxy, use the actual host as defined by the proxy. This is needed to
# properly build urls.
USE_X_FORWARDED_HOST = os.environ.get("USE_X_FORWARDED_HOST", True)
