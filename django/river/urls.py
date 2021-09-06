from django.urls import include, path

from river.api import views
from river.api.router import router

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path("api/scripts/", views.ScriptsEndpoint.as_view(), name="scripts"),
]
