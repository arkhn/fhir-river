from django.urls import include, path

from control.api.router import router

urlpatterns = [
    path("api/control/", include(router.urls)),
]
