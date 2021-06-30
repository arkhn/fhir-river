import logging

from confluent_kafka import admin, error

from django.conf import settings

logger = logging.getLogger(__name__)


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
        future_topics = self._admin_client.create_topics(
            [admin.NewTopic(topic, settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR)]
        )
        logger.debug(f"List of kafka topics after addition: {self._admin_client.list_topics().topics}")
        try:
            future_topics[topic].result(10)
        except error.KafkaException as exc:
            raise Exception(exc)

    def delete(self, topic: str):
        future_deleted_topics = self._admin_client.delete_topics([topic])
        logger.debug(f"List of kafka topics after deletion: {self._admin_client.list_topics().topics}")
        try:
            future_deleted_topics[topic].result(10)
        except error.KafkaException as exc:
            logger.error(f"KafkaException while deleting topics: {str(exc)}")
