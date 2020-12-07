from django.urls import include, path

from core.api.router import router
from core.api import views

urlpatterns = [
    path("", include(router.urls)),
    path("version/", views.VersionEndpoint.as_view()),
]
