import os
import json
import requests

from .consumer_class import EventConsumer

BATCH_SIZE_TOPIC = "batch_size"
LOAD_TOPIC = "load"

MIMIC_PATIENT_RESOURCE_ID = os.getenv("MIMIC_PATIENT_RESOURCE_ID")
MIMIC_PRACTITIONER_RESOURCE_ID = os.getenv("MIMIC_PRACTITIONER_RESOURCE_ID")


def handle_kafka_error(err):
    raise err


def test_batch_single_row():
    print("START")

    assert (
        MIMIC_PATIENT_RESOURCE_ID is not None
    ), "MIMIC_PATIENT_RESOURCE_ID missing from environment"
    assert (
        MIMIC_PRACTITIONER_RESOURCE_ID is not None
    ), "MIMIC_PRACTITIONER_RESOURCE_ID missing from environment"

    # declare kafka consumer of "load" events
    consumer = EventConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS_EXTERNAL"),
        topics=LOAD_TOPIC,
        group_id="test_batch_single_row",
        manage_error=handle_kafka_error,
    )

    def wait_batch(msg):
        msg_value = json.loads(msg.value())
        print(f"Go batch of size {msg_value['size']}, consuming events...")
        consumer.run_consumer(event_count=msg_value["size"], poll_timeout=30)

    batch_size_consumer = EventConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS_EXTERNAL"),
        topics=BATCH_SIZE_TOPIC,
        group_id="test_batch_size",
        manage_error=handle_kafka_error,
        process_event=wait_batch,
    )

    # RUN A PATIENT BATCH #
    try:
        # send a batch request
        response = requests.post(
            "http://localhost:3001/batch", json={"resource_ids": [MIMIC_PATIENT_RESOURCE_ID]},
        )
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 200, f"api POST /batch returned an error: {response.text}"

    # RUN A PRACTITIONER BATCH BATCH #
    response = requests.post(
        "http://localhost:3001/batch", json={"resource_ids": [MIMIC_PRACTITIONER_RESOURCE_ID]},
    )
    assert response.status_code == 200, f"api POST /batch returned an error: {response.text}"

    print("Waiting for a batch_size event...")
    batch_size_consumer.run_consumer(event_count=1, poll_timeout=30)

    print("Waiting for a batch_size event...")
    batch_size_consumer.run_consumer(event_count=1, poll_timeout=30)


# check in elastic that references have been set
