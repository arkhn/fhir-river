from django.urls import include, path

from control import urls as control_urls
from core import urls as core_urls
from pyrog import urls as pyrog_urls

urlpatterns = [
    path("api/core/", include(core_urls)),
    path("api/", include(control_urls)),
    path("", include(pyrog_urls)),
]
