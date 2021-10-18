from django.urls import path

from pagai.api import views

urlpatterns = [
    path("api/list-owners/", views.OwnersListView.as_view(), name="list-owners"),
    path("api/owner-schema/<owner>/", views.OwnerSchemaView.as_view(), name="owner-schema"),
    path("api/explore/", views.ExploreView.as_view(), name="explore"),
]
