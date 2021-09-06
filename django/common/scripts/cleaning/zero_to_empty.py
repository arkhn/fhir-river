from common.scripts import utils


def zero_to_empty(raw_input):
    """Return None when entry is 0"""
    if utils.is_empty(raw_input) or raw_input == "0":
        return None
    else:
        return raw_input
