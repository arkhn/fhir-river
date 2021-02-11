from django.urls import include, path

from pagai.api import views
from pagai.api.router import router

urlpatterns = [
    # TODO routes?
    path("pagai/", include(router.urls)),
    path("pagai/list-owners/", views.OwnersListView.as_view(), name="list-owners"),
]
