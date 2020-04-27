from jsonschema import ValidationError
import os
from pymongo import MongoClient

import fhirstore

from loader.src.config.logger import create_logger

FHIRSTORE_HOST = os.getenv("FHIRSTORE_HOST")
FHIRSTORE_PORT = int(os.getenv("FHIRSTORE_PORT"))
FHIRSTORE_DATABASE = os.getenv("FHIRSTORE_DATABASE")
FHIRSTORE_USER = os.getenv("FHIRSTORE_USER")
FHIRSTORE_PASSWORD = os.getenv("FHIRSTORE_PASSWORD")

_client = None
logger = create_logger("fhirstore")


def get_mongo_client():
    global _client
    if _client is None:
        _client = MongoClient(
            host=FHIRSTORE_HOST,
            port=FHIRSTORE_PORT,
            username=FHIRSTORE_USER,
            password=FHIRSTORE_PASSWORD,
        )
    return _client


_fhirstore = None


def get_fhirstore():
    global _fhirstore
    if _fhirstore is None:
        logger.debug("Create fhirstore")
        _fhirstore = fhirstore.FHIRStore(get_mongo_client(), None, FHIRSTORE_DATABASE)
        _fhirstore.resume()
    return _fhirstore


def save_one(fhir_object, bypass_validation=False):
    """
    Save instance of FHIR resource in MongoDB through fhirstore.

    args:
        fhir_object: fhir object to create
    """
    store = get_fhirstore()

    try:
        store.create(fhir_object, bypass_document_validation=bypass_validation)
    except ValidationError as e:
        logger.error(
            f"Validation failed for resource {fhir_object} at "
            f"{'.'.join(e.schema_path)}: {e.message}"
        )


def delete_one(fhir_object):
    """
    Save instance of FHIR resource in MongoDB through fhirstore.

    args:
        fhir_object: fhir object to create
    """
    store = get_fhirstore()

    try:
        resource_type = fhir_object['resourceType']
        identifier_id = fhir_object['identifier']
        store.delete(resource_type, identifier_id=identifier_id)
    except ValidationError as e:
        logger.error(
            f"Validation failed for resource {fhir_object} at "
            f"{'.'.join(e.schema_path)}: {e.message}"
        )


def upsert_one(fhir_object, bypass_validation=False):
    """
    Upsert one FHIR instance in MongoDB through fhirstore.
    :return:
    """
    store = get_fhirstore()
    resource_type = fhir_object['resourceType']
    identifier_id = fhir_object['identifier']
    try:
        store.upsert(resource_type, identifier_id, fhir_object, bypass_document_validation=bypass_validation)
    except ValidationError as e:
        logger.error(
            f"Validation failed for resource {fhir_object} at "
            f"{'.'.join(e.schema_path)}: {e.message}"
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
