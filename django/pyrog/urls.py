from django.urls import include, path

from pyrog.api import views
from pyrog.api.router import router


urlpatterns = [
    path("api/", include(router.urls)),
    path('session/', views.Session.as_view()),
    path('oidc/', include('mozilla_django_oidc.urls')),
]
