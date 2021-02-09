from rest_framework import routers

from pyrog.api import views

router = routers.SimpleRouter()

router.register(r"sources", views.SourceViewSet, basename="sources")
