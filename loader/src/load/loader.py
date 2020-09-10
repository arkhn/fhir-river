from loader.src.load.fhirstore import save_one

from arkhn_monitoring import Counter, Timer
from arkhn_monitoring.metrics import FAST_FN_BUCKETS


class Loader:
    def __init__(self, fhirstore):
        self.fhirstore = fhirstore

    @Timer("time_load", "time to perform load method of Loader", buckets=FAST_FN_BUCKETS)
    @Counter("count_load", "count calls to load method of Loader", labelnames=("resource_type",))
    def load(self, fhir_instance, resource_type):
        """
        Uses self.fhirstore to save a fhir object into a fhir DB.
        Args:
            fhir_instance: the fhir document to store in the DB
            resource_type: will be used as label for the Counter
        """
        # Bootstrap for resource if needed
        if resource_type not in self.fhirstore.resources:
            self.fhirstore.bootstrap(resource=resource_type, depth=3)

        save_one(fhir_instance)
