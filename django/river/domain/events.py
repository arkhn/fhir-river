from dataclasses import dataclass
from typing import Any, Dict, List, Optional


class Event:
    pass


@dataclass(frozen=True)
class BatchEvent(Event):
    batch_id: str
    resource_id: str
    primary_key_values: Optional[List[str]] = None


@dataclass(frozen=True)
class ExtractedRecord(Event):
    batch_id: str
    resource_type: str
    resource_id: str
    record: Dict[str, Any]
