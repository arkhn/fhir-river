from enum import Enum


class Priority(Enum):
    ROUTINE = "routine"
    URGENT = "urgent"
    ASAP = "asap"
    STAT = "stat"


def map_priority(raw_input):
    """Map int to ServiceRequest.priority (0: stat, 1: asap, 2: urgent, 3+ routine)"""
    mapping = {
        "0": Priority.STAT.value,
        "1": Priority.ASAP.value,
        "2": Priority.URGENT.value,
        "3": Priority.ROUTINE.value,
    }
    if str(raw_input) in mapping.keys():
        return mapping[str(raw_input)]
    else:
        return mapping["3"]
