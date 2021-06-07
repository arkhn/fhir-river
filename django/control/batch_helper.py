# FIXME file name and location?
from common.kafka.producer import Producer
from confluent_kafka.admin import AdminClient, NewTopic


def create_kafka_topics(topic_names, kafka_bootstrap_servers, kafka_num_partitions, kafka_replication_factor):
    new_topics = [NewTopic(topic_name, kafka_num_partitions, kafka_replication_factor) for topic_name in topic_names]
    admin_client = AdminClient({"bootstrap.servers": kafka_bootstrap_servers})
    admin_client.create_topics(new_topics)


def send_batch_events(batch_id, resource_ids, kafka_bootstrap_servers):
    producer = Producer(broker=kafka_bootstrap_servers)
    for resource_id in resource_ids:
        event = {"batch_id": batch_id, "resource_id": resource_id}
        producer.produce_event(topic=f"batch.{batch_id}", event=event)
