import os
from pymongo import MongoClient

import fhirstore


FHIRSTORE_HOST = os.getenv("FHIRSTORE_HOST")
FHIRSTORE_PORT = os.getenv("FHIRSTORE_PORT")
FHIRSTORE_DATABASE = os.getenv("FHIRSTORE_DATABASE")
FHIRSTORE_USER = os.getenv("FHIRSTORE_USER")
FHIRSTORE_PASSWORD = os.getenv("FHIRSTORE_PASSWORD")

_client = None


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
    return _fhirstore
