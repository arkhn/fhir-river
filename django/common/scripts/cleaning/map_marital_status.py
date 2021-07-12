import logging
from enum import Enum

from common.scripts import utils


class MaritalStatus(Enum):
    Divorced = "D"
    Annulled = "A"
    Interlocutory = "I"
    LegallySeparated = "L"
    Married = "M"
    Polygamous = "P"
    NeverMarried = "S"
    DomesticPartner = "T"
    Unmarried = "U"
    Widowed = "W"
    Unknown = "UNK"


def map_marital_status(code):
    """Map MIMIC marital status"""
    status = MaritalStatus
    mapping = {
        "MARRIED": status.Married.value,
        "SINGLE": status.Unmarried.value,
        "WIDOWED": status.Widowed.value,
        "SEPARATED": status.LegallySeparated.value,
        "DIVORCED": status.Divorced.value,
        "UNKNOWN": status.Unknown.value,
    }
    if code in mapping.keys():
        return mapping[code]
    elif utils.is_empty(code):
        return status.Unknown.value
    else:
        logging.warning("In {}, args {} not recognised".format("marital_status", code))
        return status.Unknown.value
