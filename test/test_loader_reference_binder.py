import os
import json
import requests
import pytest

from .consumer_class import EventConsumer
from analyzer.src.analyze.graphql import PyrogClient
from loader.src.load.fhirstore import get_fhirstore


BATCH_SIZE_TOPIC = "batch_size"
LOAD_TOPIC = "load"


@pytest.fixture(scope="module")
def get_store():
    store = get_fhirstore()
    yield store
    encounters = store.db["Encounter"]
    patients = store.db["Patient"]
    encounters.delete_many({})
    patients.delete_many({})


def handle_kafka_error(err):
    raise err


def get_resource_ids():
    sources_query = """
        query s {
            sources {
                id
                resources {
                    id
                }
            }
        }
    """
    pyrog_client = PyrogClient()
    sources_resp = pyrog_client.run_graphql_query(sources_query)
    return [resource for resource in sources_resp["data"]["sources"][0]["resources"]]


def send_batch(resource_id):
    # declare kafka consumer of "load" events
    consumer = EventConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS_EXTERNAL"),
        topics=LOAD_TOPIC,
        group_id="test_batch_single_row",
        manage_error=handle_kafka_error,
    )

    def wait_batch(msg):
        msg_value = json.loads(msg.value())
        print(f"Got batch of size {msg_value['size']}, consuming events...")
        consumer.run_consumer(event_count=msg_value["size"], poll_timeout=15)

    batch_size_consumer = EventConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS_EXTERNAL"),
        topics=BATCH_SIZE_TOPIC,
        group_id="test_batch_size",
        manage_error=handle_kafka_error,
        process_event=wait_batch,
    )

    try:
        # send a batch request
        response = requests.post(
            "http://0.0.0.0:3001/batch", json={"resource_ids": [resource_id]},
        )
        print(f"New POST request sent to River API: {resource_id}")
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 200, f"api POST /batch returned an error: {response.text}"

    print("Waiting for a batch_size event...")
    batch_size_consumer.run_consumer(event_count=1, poll_timeout=15)


def test_batch_reference_binder():
    resource_ids = get_resource_ids()

    # Send Patient and Encounter batches
    for resource in resource_ids:
        send_batch(resource["id"])

    # Check reference binding
    store = get_store()
    encounters = store.db["Encounter"]
    patients = store.db["Patient"]
    cursor = encounters.find({})
    for document in cursor:
        assert "reference" in document["subject"]
        reference = document["subject"]["reference"].split("/")
        assert reference[0] == "Patient"
        patient = patients.find_one(filter={"id": reference[1]})
        assert patient
