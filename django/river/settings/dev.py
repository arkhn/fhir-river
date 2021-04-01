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

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += ["djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer"]
REST_FRAMEWORK["DEFAULT_SCHEMA_CLASS"] = "drf_spectacular.openapi.AutoSchema"
SPECTACULAR_SETTINGS = {
  'POSTPROCESSING_HOOKS': [
        'drf_spectacular.hooks.postprocess_schema_enums',
        'drf_spectacular.contrib.djangorestframework_camel_case.camelize_serializer_fields',
    ],
  'COMPONENT_SPLIT_REQUEST': True,
}
