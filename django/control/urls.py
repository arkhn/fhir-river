from django.urls import include, path

from control.api import views
from control.api.router import router

urlpatterns = [
    path("api/control/", include(router.urls)),
    path("api/preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path("api/delete-resources/", views.ResourceEndpoint.as_view(), name="delete-resources"),
    path("api/scripts/", views.ScriptsEndpoint.as_view(), name="scripts"),
]
