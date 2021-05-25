from django.urls import include, path

from river.api.router import router

urlpatterns = [
    path("api/", include(router.urls)),
]
