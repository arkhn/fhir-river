from dataclasses import dataclass


class Event:
    pass


@dataclass(frozen=True)
class BatchResource(Event):
    batch_id: str
    resource_id: str
