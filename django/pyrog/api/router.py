from rest_framework import routers

from pyrog.api import views

router = routers.SimpleRouter()

router.register(r"sources", views.SourceViewSet, basename="sources")
router.register(r"resources", views.ResourceViewSet, basename="resources")
router.register(r"credentials", views.CredentialViewSet, basename="credentials")
router.register(r"attributes", views.AttributeViewSet, basename="attributes")
