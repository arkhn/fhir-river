from loader.src.load.fhirstore import save_one

from arkhn_monitoring import Counter, Timer, FAST_FN_BUCKETS


class Loader:
    def __init__(self, fhirstore, bypass_validation):
        self.fhirstore = fhirstore
        self.bypass_validation = bypass_validation

    @Timer("time_load", "time to perform load method of Loader", buckets=FAST_FN_BUCKETS)
    @Counter("count_load", "count calls to load method of Loader")
    def load(self, fhirstore, fhir_instance):
        # Bootstrap for resource if needed
        resource_type = fhir_instance["resourceType"]
        if resource_type not in self.fhirstore.resources:
            self.fhirstore.bootstrap(resource=resource_type, depth=3)

        save_one(fhir_instance, self.bypass_validation)
