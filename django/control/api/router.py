from rest_framework import routers

from control.api import batch, preview, recurring_batch, scripts

# Register your API views here

router = routers.SimpleRouter()
router.register(r"batch", batch.BatchEndpoint, basename="batch")
router.register(r"preview", preview.PreviewEndpoint, basename="preview")
router.register(r"recurring-batch", recurring_batch.RecurringBatchEndpoint, basename="recurring-batch")
router.register(r"scripts", scripts.ScriptsEndpoint, basename="scripts")
