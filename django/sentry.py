from django.conf import settings

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

if settings.SENTRY_ENABLED:
    sentry_sdk.init(
        dsn=settings.SENTRY["DSN"],
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,  # Performance monitoring of all transactions
        send_default_pii=True,  # Associate users to errors
        release=settings.SENTRY["RELEASE"],
        environment=settings.SENTRY["ENV"],
    )
