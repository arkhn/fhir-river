# FIXME file name and location?
from django.conf import settings

from common.kafka.producer import Producer
from confluent_kafka.admin import AdminClient, NewTopic


def create_kafka_topics(topic_names):
    new_topics = [
        NewTopic(topic_name, settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR)
        for topic_name in topic_names
    ]
    admin_client = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
    admin_client.create_topics(new_topics)


def send_batch_events(batch_id, batch_type, resource_ids):
    producer = Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS)
    for resource_id in resource_ids:
        event = {"batch_id": batch_id, "batch_type": batch_type, "resource_id": resource_id}
        producer.produce_event(topic=f"batch.{batch_type}.{batch_id}", event=event)
