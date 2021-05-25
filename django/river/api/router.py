from rest_framework import routers

from river.api import views

router = routers.SimpleRouter()

router.register(r"batches", views.BatchViewSet, basename="batches")
