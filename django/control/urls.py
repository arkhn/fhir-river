from django.urls import include, path

from control.api.router import router
from control.api import views

urlpatterns = [
    path("", include(router.urls)),
    path("preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path(
        "delete-resources/", views.ResourceEndpoint.as_view(), name="delete-resources"
    ),
]
