from django.urls import include, path

from users.api import views
from users.api.router import router

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/user/", views.UserView.as_view(), name="auth-user-detail"),
]
