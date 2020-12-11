from django.contrib import admin
from django.urls import include, path

from core import urls as core_urls
from preview import urls as preview_urls

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/core/", include(core_urls)),
    path("api/", include(preview_urls)),
]