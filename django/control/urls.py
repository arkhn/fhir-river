from django.urls import include, path

from control.api import views
from control.api.router import router

urlpatterns = [
    path("", include(router.urls)),
    # TODO put back the / and change the url in pyrog front
    path("batch", views.BatchEndpoint.as_view(), name="batch"),
    path("preview/", views.PreviewEndpoint.as_view(), name="preview"),
    path("scripts/", views.ScriptsEndpoint.as_view(), name="scripts"),
]
