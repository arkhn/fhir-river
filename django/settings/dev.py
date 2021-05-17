from .base import *

ADMIN_ENABLED = True

ALLOWED_HOSTS = ["*"]

SECRET_KEY = "USE_IN_DEV_ONLY"

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# CorsHeaders
# Intended for headless frontend development

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Rest Framework

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += ["rest_framework.renderers.BrowsableAPIRenderer"]
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = ["rest_framework.permissions.AllowAny"]

# DRF Spectacular settings

if os.environ.get("DRF_SPECTACULAR_ENABLED", False) == "True":
    INSTALLED_APPS += ["drf_spectacular"]
    REST_FRAMEWORK["DEFAULT_SCHEMA_CLASS"] = "drf_spectacular.openapi.AutoSchema"

SPECTACULAR_SETTINGS = {
    "POSTPROCESSING_HOOKS": [
        "drf_spectacular.hooks.postprocess_schema_enums",
    ],
    "COMPONENT_SPLIT_REQUEST": True,
    "TITLE": "River API",
    "DESCRIPTION": "Arkhn's River API",
    "VERSION": "0.1.0",
}
