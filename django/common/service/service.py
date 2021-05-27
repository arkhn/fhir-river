import logging
import re
from typing import Callable, Dict, Type

from confluent_kafka.error import ConsumeError

from river.adapters.event_subscriber import EventSubscriber
from river.domain import events

logger = logging.getLogger(__name__)
event_logger = logging.getLogger("river.event")


class Service:
    """Stateful service"""

    def __init__(self, subscriber: EventSubscriber, handlers: Dict[str, Callable[[Type[events.Event]], None]]) -> None:
        self.subscriber = subscriber
        self.handlers = handlers

    def run(self):
        topics = list(self.handlers.keys())
        with self.subscriber.subscribe(topics):
            while True:
                try:
                    topic, raw = self.subscriber.poll()
                except ConsumeError as err:
                    logger.error(err)
                    raise err

                try:
                    # topic can be regexp
                    topic = next(t for t in self.handlers.keys() if re.match(t, topic))
                except StopIteration:
                    logger.error(f"Unhandled topic: {topic}")

                try:
                    self.handlers[topic](raw)
                except Exception:
                    event_logger.exception("Failed to process event")
                    continue
