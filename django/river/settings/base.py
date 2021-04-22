"""
Django settings for river project.

Generated by 'django-admin startproject' using Django 3.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# API versioning
VERSION_NAME = os.environ.get("VERSION_NAME", None)
VERSION_SHA = os.environ.get("VERSION_SHA", None)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG modifies the app behaviour. For instance:
#   * it enables detailed error pages.
#   * it disables security checks (e.g. authorizes empty ALLOWED_HOSTS)
DEBUG = os.environ.get("DEBUG", False) == "True"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS") and os.environ.get("ALLOWED_HOSTS").split(",") or []

ADMIN_ENABLED = os.environ.get("ADMIN_ENABLED", False)

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # 3rd parties
    "rest_framework",
    "corsheaders",
    "django_filters",
    "mozilla_django_oidc",
    "sentry",
    # 1st parties
    "core",
    "extractor",
    "transformer",
    "loader",
    "control",
    "topicleaner",
    "pagai",
    "pyrog",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # Redirect requests to silently re-authenticated:
    "mozilla_django_oidc.middleware.SessionRefresh",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "river.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "river.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.environ.get("POSTGRES_DB", "river"),
        "USER": os.environ.get("POSTGRES_USER", "river"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "HOST": os.environ.get("POSTGRES_HOST"),
        "PORT": int(os.environ.get("POSTGRES_PORT", 5432)),
    }
}


# Custom User model
# https://docs.djangoproject.com/en/3.1/topics/auth/customizing/#substituting-a-custom-user-model

AUTH_USER_MODEL = "users.User"

# Auth backends
# https://docs.djangoproject.com/en/3.1/topics/auth/customizing/#specifying-authentication-backends

AUTHENTICATION_BACKENDS = [
    "mozilla_django_oidc.auth.OIDCAuthenticationBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Europe/Paris"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = Path(os.environ.get("STATIC_ROOT", "var/www/static"))


# Logging
# https://docs.djangoproject.com/en/3.1/topics/logging/

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "{asctime} [{levelname:>8}] {filename:>15}:{lineno:3d} {message}",
            "style": "{",
        },
        "fluentd": {
            "()": "utils.log.FluentFormatter",
            "format": {
                "logger": "{name}",
                "where": "{module}.{funcName}",
                "level": "{levelname}",
                "host": "{hostname}",
            },
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
        "fluentd": {
            "class": "fluent.handler.FluentHandler",
            "formatter": "fluentd",
            "tag": "river",
            "host": os.environ.get("FLUENTD_HOST", "fluentd"),
            "port": int(os.environ.get("FLUENTD_PORT", 24224)),
        },
    },
    "root": {
        "handlers": ["console", "fluentd"],
        "level": os.environ.get("LOG_LEVEL", "INFO"),
    },
}

# CorsHeaders
# Used to access api from third-party domain

CORS_URLS_REGEX = r"^\/(api|oidc)\/.*$"

# Rest Framework
# https://www.django-rest-framework.org/api-guide/settings/

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}

# Redis

REDIS_COUNTER_HOST = os.environ.get("REDIS_COUNTER_HOST", "redis")
REDIS_COUNTER_PORT = int(os.environ.get("REDIS_COUNTER_PORT", 6379))
REDIS_COUNTER_DB = os.environ.get("REDIS_COUNTER_DB", 2)

REDIS_MAPPINGS_HOST = os.environ.get("REDIS_MAPPINGS_HOST", "redis")
REDIS_MAPPINGS_PORT = int(os.environ.get("REDIS_MAPPINGS_PORT", 6379))
REDIS_MAPPINGS_DB = os.environ.get("REDIS_MAPPINGS_DB", 1)

REDIS_REFERENCES_HOST = os.environ.get("REDIS_REFERENCES_HOST", "redis")
REDIS_REFERENCES_PORT = int(os.environ.get("REDIS_REFERENCES_PORT", 6379))
REDIS_REFERENCES_DB = os.environ.get("REDIS_REFERENCES_DB", 0)

# Kafka

KAFKA_BOOTSTRAP_SERVERS = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
KAFKA_NUM_PARTITIONS = os.environ.get("KAFKA_NUM_PARTITIONS", 1)
KAFKA_REPLICATION_FACTOR = os.environ.get("KAFKA_REPLICATION_FACTOR", 1)

# API URLs

PYROG_API_URL = os.environ.get("PYROG_API_URL", "pyrog-server:1000")
FHIR_API_URL = os.environ.get("FHIR_API_URL", "fhir-api:2000")

# MongoDB

FHIRSTORE_HOST = os.environ.get("FHIRSTORE_HOST", "mongo")
FHIRSTORE_PORT = int(os.environ.get("FHIRSTORE_PORT", 27017))
FHIRSTORE_DATABASE = os.environ.get("FHIRSTORE_DATABASE", "fhirstore")
FHIRSTORE_USER = os.environ.get("FHIRSTORE_USER")
FHIRSTORE_PASSWORD = os.environ.get("FHIRSTORE_PASSWORD")

# Prometheus

EXPORTER_PORT = os.environ.get("EXPORTER_PORT", 8001)

# Mozilla OpenID Connect
# https://mozilla-django-oidc.readthedocs.io/en/stable/settings.html

OIDC_STORE_ID_TOKEN = True
OIDC_STORE_ACCESS_TOKEN = True
# Silently re-authenticated after following time:
OIDC_RENEW_ID_TOKEN_EXPIRY_SECONDS = int(os.environ.get("OIDC_RENEW_ID_TOKEN_EXPIRY_SECONDS", 12 * 60 * 60))
# Enable HTTP Basic Authorization method:
# the OAuth 2.0 Client ID and secret are sent in the HTTP Header
OIDC_TOKEN_USE_BASIC_AUTH = os.environ.get("OIDC_TOKEN_USE_BASIC_AUTH", False) == "True"

# Relying party
OIDC_RP_CLIENT_ID = os.environ.get("OIDC_RP_CLIENT_ID")
OIDC_RP_CLIENT_SECRET = os.environ.get("OIDC_RP_CLIENT_SECRET")
OIDC_RP_EXTRA_SCOPES = os.environ.get("OIDC_RP_EXTRA_SCOPES", "").replace(",", " ").split(" ")
OIDC_RP_SCOPES = " ".join(["openid", *OIDC_RP_EXTRA_SCOPES])
OIDC_RP_SIGN_ALGO = os.environ.get("OIDC_RP_SIGN_ALGO")

LOGIN_REDIRECT_URL = os.environ.get("LOGIN_REDIRECT_URL")
LOGIN_REDIRECT_URL_FAILURE = os.environ.get("LOGIN_REDIRECT_URL_FAILURE")
LOGOUT_REDIRECT_URL = os.environ.get("LOGOUT_REDIRECT_URL")

# Provider
OIDC_OP_AUTHORIZATION_ENDPOINT = os.environ.get("OIDC_OP_AUTHORIZATION_ENDPOINT")
OIDC_OP_TOKEN_ENDPOINT = os.environ.get("OIDC_OP_TOKEN_ENDPOINT")
OIDC_OP_USER_ENDPOINT = os.environ.get("OIDC_OP_USER_ENDPOINT")

if OIDC_RP_SIGN_ALGO == "RS256":
    OIDC_OP_JWKS_ENDPOINT = os.environ.get("OIDC_OP_JWKS_ENDPOINT")
elif OIDC_RP_SIGN_ALGO == "HS256":
    pass

# Sentry

SENTRY_ENABLED = os.environ.get("SENTRY_ENABLED", False)

if SENTRY_ENABLED:
    SENTRY = {
        "DSN": os.environ.get("SENTRY_DSN"),
        "ENV": os.environ.get("SENTRY_ENVIRONMENT"),
        "RELEASE": os.environ.get("SENTRY_RELEASE", VERSION_NAME or VERSION_SHA),
    }
