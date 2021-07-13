from enum import Enum


class Priority(Enum):
    ROUTINE = "routine"
    URGENT = "urgent"
    ASAP = "asap"
    STAT = "stat"


def map_priority(raw_input):
    """Map int to ServiceRequest.priority (1: stat, 2: asap, 3: urgent, else: routine)"""
    mapping = {
        "1": Priority.STAT.value,
        "2": Priority.ASAP.value,
        "3": Priority.URGENT.value,
        "4": Priority.ROUTINE.value,
    }
    try:
        return mapping[str(raw_input)]
    except KeyError:
        # if the code is unknown, use "ROUTINE" as default value
        return Priority.ROUTINE.value
