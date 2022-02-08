import json
import logging

from django.conf import settings

import requests
from prometheus_client import Counter as PromCounter
from river.adapters.event_subscriber import EventSubscriber
from river.common.service.service import Service
from river.domain import events

logger = logging.getLogger(__name__)


counter_loaded_instances = PromCounter(
    "count_loaded_instances",
    "Number of resource instances loaded",
)

BUNDLE_SIZE = settings.LOADER_BUNDLE_SIZE


def list_compact(array: list) -> list:
    for index, item in enumerate(array):
        if isinstance(item, dict):
            array[index] = dict_compact(item)
            if not len(array[index]):
                array[index] = None
        elif isinstance(item, list):
            array[index] = list_compact(item)
            if not len(array[index]):
                array[index] = None
    return [item for item in array if item is not None]


def dict_compact(obj: dict) -> dict:
    for key, value in obj.items():
        if isinstance(value, dict):
            obj[key] = dict_compact(value)
            if not len(obj[key]):
                obj[key] = None
        elif isinstance(value, list):
            obj[key] = list_compact(value)
            if not len(obj[key]):
                obj[key] = None
    return {key: value for key, value in obj.items() if value is not None}


class BundleBuilder:
    def __init__(self):
        self.bundle = self.empty_bundle()

    @staticmethod
    def empty_bundle():
        return {
            "resourceType": "Bundle",
            "type": "transaction",
            "entry": [],
        }

    def add_entry(self, resource, method):
        resource_json = dict_compact(json.loads(resource))
        entry = {
            "resource": resource_json,
            "request": {
                "method": method,
                "url": f"{resource_json['resourceType']}/{resource_json['id']}",
            },
        }
        self.bundle["entry"].append(entry)

    def commit_bundle(self):
        if len(self.bundle["entry"]) >= BUNDLE_SIZE:
            logger.info({"message": f"Sending {self.bundle}"})
            response = requests.post(
                settings.FHIR_API_URL,
                json=self.bundle,
                headers={"Content-type": "application/json+fhir", "X-Upsert-Extistence-Check": "disabled"},
            )
            logger.info(f"Post bundle response: {response.json()}")
            self.bundle = self.empty_bundle()
            counter_loaded_instances.inc(BUNDLE_SIZE)


def batch_resource_handler(event: events.FhirRecord, bundle_builder: BundleBuilder):
    logger.info({"message": f"Processing {event}"})

    bundle_builder.add_entry(event.payload["after"]["fhir"], method="PUT")
    bundle_builder.commit_bundle()


def bootstrap(
    subscriber: EventSubscriber,
) -> Service:
    bundle_builder = BundleBuilder()
    handlers = {
        "^postgres\\..*": lambda raw: batch_resource_handler(
            event=events.FhirRecord(payload=raw["payload"]),
            bundle_builder=bundle_builder,
        )
    }

    return Service(subscriber, handlers)
