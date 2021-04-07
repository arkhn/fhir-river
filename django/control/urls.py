from django.urls import include, path

from control.api import views
from control.api.router import router

urlpatterns = [
    path("", include(router.urls)),
    path("preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path("scripts/", views.ScriptsEndpoint.as_view(), name="scripts"),
    path("delete-resources/", views.ResourceEndpoint.as_view(), name="delete-resources"),
]
