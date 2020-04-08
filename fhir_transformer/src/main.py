#!/usr/bin/env python

import os
from confluent_kafka import KafkaException, KafkaError

from fhir_transformer.src.consumer_class import TransformerConsumer
from fhir_transformer.src.producer_class import TransformerProducer
from fhir_transformer.src.config.logger import create_logger
from fhir_transformer.src.helper import get_topic_name
from fhir_transformer.src.transform import Transformer

MAX_ERROR_COUNT = 3
TOPIC = [get_topic_name(source="mimic", resource="Patient", task_type="extract")]
GROUP_ID = "arkhn_transformer"

logger = create_logger("consumer")


if __name__ == "__main__":
    logger.info("Running Consumer")

    producer = TransformerProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    transformer = Transformer(producer)
    
    consumer = TransformerConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=TOPIC,
        group_id=GROUP_ID,
        process_event=transformer.process_event,
        manage_error=transformer.manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)
