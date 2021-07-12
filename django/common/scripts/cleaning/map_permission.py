from enum import Enum

from common.scripts import utils


class Authorization(Enum):
    PERMIT = "permit"
    DENY = "deny"


def map_permission(raw_input):
    """Map UMLS codes (Yes, No) to (permit, deny)"""
    if utils.is_empty(raw_input):
        return None
    mapping = {
        "UMLS:C1298907": Authorization.PERMIT.value,
        "UMLS:C1298908": Authorization.DENY.value,
    }
    if raw_input in mapping.keys():
        return mapping[raw_input]
