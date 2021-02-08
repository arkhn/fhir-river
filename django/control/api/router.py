from rest_framework import routers

from control.api import views

# Register your API views here

router = routers.SimpleRouter()
router.register(r"batch", views.BatchEndpoint, basename="batch")
router.register(r"preview", views.PreviewEndpoint, basename="preview")
router.register(r"scripts", views.ScriptsEndpoint, basename="scripts")
