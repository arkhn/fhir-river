import os
from prometheus_client import Counter
from pymongo import MongoClient

import fhirstore
from fhir.resources.operationoutcome import OperationOutcome

from loader.src.config.logger import get_logger
from loader.src.load.utils import get_resource_id


FHIRSTORE_HOST = os.getenv("FHIRSTORE_HOST")
FHIRSTORE_PORT = os.getenv("FHIRSTORE_PORT")
FHIRSTORE_DATABASE = os.getenv("FHIRSTORE_DATABASE")
FHIRSTORE_USER = os.getenv("FHIRSTORE_USER")
FHIRSTORE_PASSWORD = os.getenv("FHIRSTORE_PASSWORD")

_client = None
_fhirstore = None
logger = get_logger()

counter_failed_validations = Counter(
    "count_failed_validations",
    "count number of times validation has failed",
    labelnames=("resource_id",),
)


def get_mongo_client():
    global _client
    if _client is None:
        _client = MongoClient(
            host=FHIRSTORE_HOST,
            port=int(FHIRSTORE_PORT),
            username=FHIRSTORE_USER,
            password=FHIRSTORE_PASSWORD,
        )
    return _client


def get_fhirstore():
    global _fhirstore
    if _fhirstore is None:
        _fhirstore = fhirstore.FHIRStore(get_mongo_client(), None, FHIRSTORE_DATABASE)
        # FIXME do we really want to bootstrap here?
        if not _fhirstore.initialized:
            _fhirstore.bootstrap()
    return _fhirstore


def save_one(fhir_object):
    """
    Save instance of FHIR resource in MongoDB through fhirstore.

    args:
        fhir_object: fhir object to create
    """
    store = get_fhirstore()

    resource = store.create(fhir_object)
    if isinstance(resource, OperationOutcome):
        resource_id = get_resource_id(fhir_object)
        # Increment counter for failed validations
        counter_failed_validations.labels(resource_id=resource_id).inc()
        # Log
        logger.error(
            f"Validation failed for resource {fhir_object}: {resource['issue']}",
            extra={"resource_id": resource_id},
        )


def get_resource_instances(resource_id, resource_type):
    global _client
    store = _client[FHIRSTORE_DATABASE]
    return store[resource_type].find(
        {
            "meta.tag": {
                "$elemMatch": {
                    "code": {"$eq": resource_id},
                    "system": {"$eq": fhirstore.ARKHN_CODE_SYSTEMS.resource},
                }
            }
        }
    )
