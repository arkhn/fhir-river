from django.contrib.auth.decorators import login_required
from django.urls import include, path

from pyrog.api import views
from pyrog.api.router import router

urlpatterns = [
    path(r"api/fhir/<path>", login_required(views.FhirProxyView.as_view())),
    path("api/", include(router.urls)),
]
