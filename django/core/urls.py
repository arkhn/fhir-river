from django.urls import include, path

from core.api import views
from core.api.router import router

urlpatterns = [
    path("api/core/", include(router.urls)),
    path("api/core/version/", views.VersionEndpoint.as_view()),
]
