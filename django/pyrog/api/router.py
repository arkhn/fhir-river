from rest_framework import routers

from pyrog.api import views

router = routers.SimpleRouter()

router.register(r"projects", views.ProjectViewSet, basename="projects")
router.register(r"resources", views.ResourceViewSet, basename="resources")
router.register(r"credentials", views.CredentialViewSet, basename="credentials")
router.register(r"attributes", views.AttributeViewSet, basename="attributes")
router.register(r"input-groups", views.InputGroupViewSet, basename="input-groups")
router.register(r"static-inputs", views.StaticInputViewSet, basename="static-inputs")
router.register(r"sql-inputs", views.SQLInputViewSet, basename="sql-inputs")
router.register(r"columns", views.ColumnViewSet, basename="columns")
router.register(r"joins", views.JoinViewSet, basename="joins")
router.register(r"conditions", views.ConditionViewSet, basename="conditions")
router.register(r"filters", views.FilterViewSet, basename="filters")
router.register(r"owners", views.OwnerViewSet, basename="owners")
