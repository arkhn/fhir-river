from rest_framework import routers

from pagai.api import views

router = routers.SimpleRouter()

router.register(r"owners", views.OwnersViewSet, basename="owners")
