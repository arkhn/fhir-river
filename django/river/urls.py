from django.urls import include, path

urlpatterns = [
    path("", include("core.urls")),
    path("", include("control.urls")),
    path("", include("pyrog.urls")),
]
