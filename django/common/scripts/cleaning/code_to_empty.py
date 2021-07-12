from common.scripts import utils


def code_to_empty(raw_input):
    """Return None when entry is some code: -1 or (sans)"""
    if utils.is_empty(raw_input) or raw_input == "-1" or raw_input == "(sans)":
        return None
    else:
        return raw_input
