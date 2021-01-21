from django.urls import include, path

from core.api import views
from core.api.router import router

urlpatterns = [
    path("", include(router.urls)),
    path("version/", views.VersionEndpoint.as_view()),
]
