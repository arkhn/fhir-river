from django.conf import settings

import fhirstore

from pymongo import MongoClient


def get_fhirstore():
    mongo_client = MongoClient(
        host=settings.FHIRSTORE_HOST,
        port=settings.FHIRSTORE_PORT,
        username=settings.FHIRSTORE_USER,
        password=settings.FHIRSTORE_PASSWORD,
    )
    fhirstore_client = fhirstore.FHIRStore(mongo_client, None, settings.FHIRSTORE_DATABASE)
    return fhirstore_client
