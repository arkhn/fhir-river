from enum import Enum

from common.scripts.utils import is_empty


class intent(Enum):
    PLAN = "plan"
    ORDER = "order"
    PROPOSAL = "proposal"


def map_intent(raw_input):
    """Map (0,1,NULL) to (plan, order, proposal)"""
    mapping = {0: intent.PLAN.value, 1: intent.ORDER.value}
    if is_empty(input):
        return intent.PROPOSAL.value
    elif raw_input in mapping.keys():
        return mapping[raw_input]
    else:
        return None
