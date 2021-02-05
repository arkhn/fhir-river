from django.urls import include, path

from control.api import views
from control.api.router import router

urlpatterns = [
    path("api/control/", include(router.urls)),
    # TODO put back the / and change the url in pyrog front
    path("api/batch", views.BatchEndpoint.as_view(), name="batch"),
    path("api/batch/<batch_id>", views.DeleteBatchEndpoint.as_view(), name="delete-batch"),
    path("api/preview", views.PreviewEndpoint.as_view(), name="preview"),
    path("api/scripts/", views.ScriptsEndpoint.as_view(), name="scripts"),
]
