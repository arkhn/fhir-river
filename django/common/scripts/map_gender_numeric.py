from enum import Enum


class Gender(Enum):
    MALE = "male"
    FEMALE = "female"
    UNKNOWN = "unknown"


def map_gender_numeric(raw_input):
    """Map gender from (1,2) to (male, female)"""
    mapping = {1: Gender.MALE.value, 2: Gender.FEMALE.value}
    if raw_input in mapping.keys():
        return mapping[raw_input]
    else:
        return Gender.UNKNOWN.value
