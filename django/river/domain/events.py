from dataclasses import dataclass
from typing import Any, Optional


class Event:
    pass


@dataclass(frozen=True)
class BatchResource(Event):
    batch_id: str
    resource_id: str
    primary_key_values: Optional[Any] = None


@dataclass(frozen=True)
class ExtractedRecord(Event):
    batch_id: str
    resource_type: str
    resource_id: str
    record: Any
