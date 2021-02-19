import logging

from fhir.resources.operationoutcome import OperationOutcome
from fhirstore import DuplicateError, ValidationError

from arkhn_monitoring import Counter, Timer
from loader.load.utils import get_resource_id
from prometheus_client import Counter as PromCounter

logger = logging.getLogger(__name__)

counter_failed_validations = PromCounter(
    "count_failed_validations",
    "count number of times validation has failed",
    labelnames=("resource_id", "resource_type"),
)


class Loader:
    def __init__(self, fhirstore):
        self.fhirstore = fhirstore

    @Timer("time_load", "time to perform load method of Loader")
    @Counter(
        "count_load",
        "count calls to load method of Loader",
        labelnames=("resource_type",),
    )
    def load(self, fhir_instance, resource_type):
        """
        Uses self.fhirstore to save a fhir object into a fhir DB.
        Args:
            fhir_instance: the fhir document to store in the DB
            resource_type: will be used as label for the Counter
        """
        resource = self.fhirstore.create(fhir_instance)

        if isinstance(resource, OperationOutcome):
            resource_id = get_resource_id(fhir_instance)

            # A bit ugly, DuplicateError should have had code as a class attribute
            if resource.issue[0].code == DuplicateError("").code:
                message = "Document already present"
            elif resource.issue[0].code == ValidationError("").code:
                # Increment counter for failed validations
                counter_failed_validations.labels(resource_id=resource_id, resource_type=resource_type).inc()
                message = "Validation failed"
            else:
                message = "Error while loading the fhir document"

            # Log
            logger.exception(
                {
                    "message": message,
                    "diagnostics": "\n".join(issue.diagnostics for issue in resource.issue),
                    "document": fhir_instance,
                    "resource_id": resource_id,
                }
            )
