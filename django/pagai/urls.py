from django.urls import path

from pagai.api import views

urlpatterns = [
    path("pagai/owners/", views.OwnersListView.as_view(), name="list-owners"),
    path("pagai/owners/<owner>/schema/", views.OwnerSchemaView.as_view(), name="owner-schema"),
    path("pagai/explore/<resource_id>/<owner>/<table>/", views.ExploreView.as_view(), name="explore"),
]
