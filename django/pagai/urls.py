from django.urls import path

from pagai.api import views

urlpatterns = [
    path("pagai/list-owners/", views.OwnersListView.as_view(), name="list-owners"),
    path("pagai/owner-schema/<owner>/", views.OwnerSchemaView.as_view(), name="owner-schema"),
    path("pagai/explore/", views.ExploreView.as_view(), name="explore"),
]
