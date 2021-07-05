import logging
import re
import traceback
from typing import Callable, Dict, Type

from confluent_kafka.error import ConsumeError

from river.adapters.event_subscriber import EventSubscriber
from river.domain import events
from river.models import Error

logger = logging.getLogger(__name__)
event_logger = logging.getLogger("river.event")


class Service:
    """Stateful service"""

    def __init__(
        self,
        subscriber: EventSubscriber,
        handlers: Dict[str, Callable[[Type[events.Event]], None]],
    ) -> None:
        self.subscriber = subscriber
        self.handlers = handlers

    def run(self):
        topics = list(self.handlers.keys())
        with self.subscriber.subscribe(topics):
            while True:
                try:
                    polled_topic, raw = self.subscriber.poll()
                except ConsumeError as err:
                    logger.error(err)
                    raise err

                try:
                    # topic can be regexp
                    matching_topic = next(t for t in self.handlers.keys() if re.match(t, polled_topic))
                except StopIteration:
                    logger.error(f"Unhandled topic: {polled_topic}")
                    continue

                try:
                    self.handlers[matching_topic](raw)
                except Exception as exc:
                    event_logger.exception(f"Failed to process event: {raw} from {polled_topic}")
                    Error.objects.create(
                        batch_id=raw["batch_id"],
                        event=raw,
                        message=str(exc),
                        exception=traceback.format_exc(),
                    )
                    continue
