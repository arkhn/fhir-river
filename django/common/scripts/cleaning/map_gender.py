from enum import Enum

from common.scripts import utils


class Gender(Enum):
    MALE = "male"
    FEMALE = "female"
    UNKNOWN = "unknown"


def map_gender(raw_input):
    """Map gender from (M,F) or (HL7:M, HL7:F) to (male,female)"""
    if utils.is_empty(raw_input):
        return None

    mapping = {
        "M": Gender.MALE.value,
        "F": Gender.FEMALE.value,
        "HL7:M": Gender.MALE.value,
        "HL7:F": Gender.FEMALE.value,
    }
    if raw_input in mapping.keys():
        return mapping[raw_input]
    else:
        return Gender.UNKNOWN.value
