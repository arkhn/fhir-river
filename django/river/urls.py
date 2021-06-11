from django.urls import include, path

from river.api import views
from river.api.router import router

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/preview/", views.PreviewEndpoint.as_view(), name="preview"),
]
