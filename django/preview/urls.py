from django.urls import include, path

from preview.api.router import router

urlpatterns = [
    path("", include(router.urls)),
]
