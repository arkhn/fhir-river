import logging
import uuid

logger = logging.getLogger("river.events")


class Event:
    def __init__(self, data: dict, logger: logging.Logger = logger) -> None:
        self.id = uuid.uuid4()
        self.data = data

        adapter = logging.LoggerAdapter(logger, {"event_id": self.id})
        self.logger = adapter
