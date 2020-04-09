import logging

from fhir_loader.src.load.fhirstore import save_one


class Loader:
    def __init__(self, fhirstore, bypass_validation):
        self.fhirstore = fhirstore
        self.bypass_validation = bypass_validation

    def load(self, fhirstore, fhir_instance):
        # Bootstrap for resource if needed
        resource_type = fhir_instance["resourceType"]
        if resource_type not in self.fhirstore.resources:
            self.fhirstore.bootstrap(resource=resource_type, depth=3)

        save_one(fhir_instance, self.bypass_validation)
