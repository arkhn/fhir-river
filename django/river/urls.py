from django.urls import include, path

from river.api import views
from river.api.router import router

urlpatterns = [
    path("river/", include(router.urls)),
    path("river/preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path("river/scripts/", views.ScriptsEndpoint.as_view(), name="scripts"),
]
