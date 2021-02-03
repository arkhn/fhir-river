from django.conf import settings

from common.kafka.producer import Producer
from confluent_kafka.admin import AdminClient

producer = Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS)

admin_client = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
