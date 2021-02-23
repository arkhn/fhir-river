from .base import *

ADMIN_ENABLED = True

ALLOWED_HOSTS = ["*"]

SECRET_KEY = "USE_IN_DEV_ONLY"

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# CorsHeaders
# Intended for headless frontend development

CORS_ORIGIN_WHITELIST = ["http://localhost:3000"]

# Rest Framework

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += ["rest_framework.renderers.BrowsableAPIRenderer"]
