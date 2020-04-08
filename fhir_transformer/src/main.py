#!/usr/bin/env python

import os
import json
from confluent_kafka import KafkaException, KafkaError
from fhir_transformer.src.consumer_class import TransformerConsumer
from fhir_transformer.src.producer_class import TransformerProducer
from fhir_transformer.src.config.logger import create_logger
from fhir_transformer.src.helper import get_topic_name

MAX_ERROR_COUNT = 3
TOPIC = [get_topic_name(source="mimic", resource="Patient", task_type="extract")]
GROUP_ID = "arkhn_transformer"

logging = create_logger("consumer")


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    # Do stuff
    msg_value = json.loads(msg.value())
    msg_topic = msg.topic()
    logging.info("Transformer")
    logging.info(msg_topic)
    logging.info(msg_value)

    try:
        record = {"example": {"patient": "fhirised"}}
        topic = get_topic_name(
            source="mimic", resource=msg_value["resource_type"], task_type="transform"
        )
        producer.produce_event(topic=topic, record=record)
    except KeyError as err:
        logging.error(err)


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logging.error(msg.error())
    pass


if __name__ == "__main__":
    logging.info("Running Consumer")
    consumer = TransformerConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=TOPIC,
        group_id=GROUP_ID,
        process_event=process_event,
        manage_error=manage_kafka_error,
    )
    producer = TransformerProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logging.error(err)
