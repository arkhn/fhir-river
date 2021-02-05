from django.urls import include, path

from pyrog.api.router import router

urlpatterns = [
    path("api/", include(router.urls)),
]
