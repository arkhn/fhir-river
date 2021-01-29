from rest_framework import routers

from pyrog.api import views

router = routers.DefaultRouter()

router.register(r"sources", views.SourceViewSet, basename="sources")
