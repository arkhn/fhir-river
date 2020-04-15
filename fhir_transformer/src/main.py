#!/usr/bin/env python

import json
import os
from confluent_kafka import KafkaException, KafkaError

from fhir_transformer.src.analyze import Analyzer
from fhir_transformer.src.transform import Transformer

from fhir_transformer.src.consumer_class import TransformerConsumer
from fhir_transformer.src.producer_class import TransformerProducer

from fhir_transformer.src.config.logger import create_logger
from fhir_transformer.src.helper import get_topic_name

TOPIC = [get_topic_name(source="mimic", resource="Patient", task_type="extract")]
GROUP_ID = "arkhn_transformer"

logger = create_logger("consumer")


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    # Do stuff
    msg_value = json.loads(msg.value())
    logger.debug("Transformer")
    logger.debug(msg_value)

    try:
        logger.debug("Get Analysis")
        analysis = analyzer.get_analysis(msg_value["resource_id"])

        data = msg_value["dataframe"]
        logger.debug("Transform Df")
        data = transformer.transform_data(data, analysis)

        logger.debug("Create FHIR Doc")
        fhir_document = transformer.create_fhir_document(data, analysis)

        topic = get_topic_name(
            source="mimic", resource=msg_value["resource_type"], task_type="transform"
        )
        producer.produce_event(topic=topic, record=fhir_document)

    except Exception as err:
        logger.error(err)


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logger.error(msg.error())


if __name__ == "__main__":
    logger.info("Running Consumer")

    analyzer = Analyzer()
    transformer = Transformer()

    producer = TransformerProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    consumer = TransformerConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=TOPIC,
        group_id=GROUP_ID,
        process_event=process_event,
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)
