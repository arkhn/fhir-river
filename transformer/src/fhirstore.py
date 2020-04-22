import os
from pymongo import MongoClient
import fhirstore

from transformer.src.config.logger import create_logger

FHIRSTORE_HOST = os.getenv("FHIRSTORE_HOST")
FHIRSTORE_PORT = int(os.getenv("FHIRSTORE_PORT", ""))
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
        _fhirstore = fhirstore.FHIRStore(get_mongo_client(), None, FHIRSTORE_DATABASE)
        _fhirstore.resume()
        if len(_fhirstore.resources) == 0:
            _fhirstore.bootstrap(depth=3)
    return _fhirstore
