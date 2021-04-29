from rest_framework import routers

from pyrog.api import views

router = routers.SimpleRouter()

router.register(r"StructureDefinition", views.StructureDefinitionViewSet, basename="structure-definition")
router.register(r"sources", views.SourceViewSet, basename="sources")
router.register(r"resources", views.ResourceViewSet, basename="resources")
router.register(r"credentials", views.CredentialViewSet, basename="credentials")
router.register(r"attributes", views.AttributeViewSet, basename="attributes")
router.register(r"input-groups", views.InputGroupViewSet, basename="input-groups")
router.register(r"inputs", views.InputViewSet, basename="inputs")
router.register(r"columns", views.ColumnViewSet, basename="columns")
router.register(r"joins", views.JoinViewSet, basename="joins")
router.register(r"conditions", views.ConditionViewSet, basename="conditions")
router.register(r"filters", views.FilterViewSet, basename="filters")
router.register(r"owners", views.OwnerViewSet, basename="owners")
