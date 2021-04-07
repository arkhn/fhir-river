from .base import *

ADMIN_ENABLED = True

ALLOWED_HOSTS = ["*"]

SECRET_KEY = "USE_IN_DEV_ONLY"

# CorsHeaders
# Intended for headless frontend development

CORS_ORIGIN_WHITELIST = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True

# Rest Framework

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += ["rest_framework.renderers.BrowsableAPIRenderer"]
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = ["rest_framework.permissions.AllowAny"]
