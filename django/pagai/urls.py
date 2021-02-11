from django.urls import include, path

from pagai.api.router import router

urlpatterns = [
    # TODO routes?
    path("pagai/", include(router.urls)),
]
