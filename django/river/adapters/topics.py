from confluent_kafka import admin, error

from django.conf import settings


class TopicsManager:
    def create(self, topic: str):
        raise NotImplementedError

    def delete(self, topic: str):
        raise NotImplementedError


class FakeTopicsManager(TopicsManager):
    def __init__(self, topics=list()):
        self._topics = set(topics)

    def create(self, topic: str):
        self._topics.add(topic)

    def delete(self, topic: str):
        self._topics.remove(topic)


class KafkaTopicsManager(TopicsManager):
    def __init__(self):
        self._admin_client = admin.AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})

    def create(self, topic: str):
        ret = self._admin_client.create_topics(
            [admin.NewTopic(topic, settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR)]
        )
        try:
            ret[topic].result(1)
        except error.KafkaException as exc:
            raise Exception(exc)

    def delete(self, topic: str):
        ret = self._admin_client.delete_topics([topic])
        try:
            ret[topic].result(1)
        except error.KafkaException as exc:
            raise Exception(exc)
