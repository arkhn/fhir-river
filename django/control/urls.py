from django.urls import include, path

from control.api.router import router

urlpatterns = [
    path("api/", include(router.urls)),
]
