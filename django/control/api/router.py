from rest_framework import routers

from control.api import batch, preview, scripts

# Register your API views here

router = routers.SimpleRouter()
router.register(r"batch", batch.BatchEndpoint, basename="batch")
router.register(r"preview", preview.PreviewEndpoint, basename="preview")
router.register(r"scripts", scripts.ScriptsEndpoint, basename="scripts")
