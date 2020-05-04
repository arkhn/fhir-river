import os
import requests

from .consumer_class import EventConsumer

LOAD_TOPIC = "load"

MIMIC_PATIENT_RESOURCE_ID = os.getenv("MIMIC_PATIENT_RESOURCE_ID")
MIMIC_PRACTITIONER_RESOURCE_ID = os.getenv("MIMIC_PRACTITIONER_RESOURCE_ID")
MIMIC_PATIENT_COUNT = 100
MIMIC_PRACTITIONER_COUNT = 129


def handle_kafka_error(err):
    raise err


def test_batch_single_row():
    print("START")

    # declare kafka consumer of "transform" events
    consumer = EventConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=LOAD_TOPIC,
        group_id="test_batch_single_row",
        manage_error=handle_kafka_error,
    )

    event_count = 0

    def assert_fhir_object(msg):
        # assert inserted object
        # fhir_instance = json.loads(msg.value())
        # assert fhir_instance == {}
        nonlocal event_count
        event_count += 1

    consumer.process_event = assert_fhir_object

    # RUN A PATIENT BATCH #
    try:
        # send a batch request
        response = requests.post(
            "http://localhost:5000/batch", json={"resource_ids": [MIMIC_PATIENT_RESOURCE_ID]},
        )
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 200, "api POST /batch returned an error"

    # RUN A PRACTITIONER BATCH BATCH #
    response = requests.post(
        "http://localhost:5000/batch", json={"resource_ids": [MIMIC_PRACTITIONER_RESOURCE_ID]},
    )
    assert response.status_code == 200, "api POST /batch returned an error"

    consumer.run_consumer(event_count=MIMIC_PATIENT_COUNT)
    consumer.run_consumer(event_count=MIMIC_PRACTITIONER_COUNT)


# check in elastic that references have been set
