from .base import *

# TODO: Requests should be authenticated. The following is a temporary workaround that
#   will be removed once authencation is setup globally.
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = ["rest_framework.permissions.AllowAny"]

USE_X_FORWARDED_HOST = os.environ.get("USE_X_FORWARDED_HOST", True)
