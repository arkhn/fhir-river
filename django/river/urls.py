from django.conf import settings
from django.urls import include, path

urlpatterns = [
    path("", include("core.urls")),
    path("", include("control.urls")),
    path("", include("pagai.urls")),
    path("", include("pyrog.urls")),
    path("", include("users.urls")),
    path("oidc/", include("mozilla_django_oidc.urls")),
]

if settings.ADMIN_ENABLED:
    from django.contrib import admin

    urlpatterns += [path("admin/", admin.site.urls)]
