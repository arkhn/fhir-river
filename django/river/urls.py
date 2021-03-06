from django.urls import include, path

from control import urls as control_urls
from core import urls as core_urls

urlpatterns = [
    path("api/core/", include(core_urls)),
    path("api/", include(control_urls)),
]
