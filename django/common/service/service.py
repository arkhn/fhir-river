import logging

from confluent_kafka.error import ConsumeError

from common.kafka.consumer import Consumer
from common.service.event import Event
from common.service.handler import Handler


logger = logging.getLogger(__name__)


class Service:
    """Stateful service"""

    def __init__(self, consumer: Consumer, handler: Handler) -> None:
        self.consumer = consumer
        self.handler = handler

    def run(self):
        with self.consumer.subscribe() as subscription:
            while True:
                try:
                    data = subscription()
                except ConsumeError as err:
                    logging.error(err)
                    raise err

                event = Event(data)

                try:
                    self.handler(event)
                except Exception as err:
                    logging.error(err)
                    continue
