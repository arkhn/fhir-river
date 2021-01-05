from django.urls import include, path

from preview.api.router import router
from preview.api import views

urlpatterns = [
    path("", include(router.urls)),
    path("preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path(
        "delete-resources/", views.ResourceEndpoint.as_view(), name="delete-resources"
    ),
]
