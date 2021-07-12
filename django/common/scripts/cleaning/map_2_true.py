from common.scripts import utils


def map_2_true(raw_input):
    """Map some code from (2->True) and None otherwise"""
    if utils.is_empty(raw_input) or raw_input != 2:
        return None
    else:
        return True
