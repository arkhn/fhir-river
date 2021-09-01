import logging
import re

from common.scripts import utils


def clean_quantity(raw_input):
    """
    [deprecated: river parses types automatically]
    Removes input not conform to FHIR quantity type
    """
    if isinstance(raw_input, (float, int)):
        return raw_input

    if utils.is_empty(raw_input):
        return None
    number = re.search(r"-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?", raw_input)
    if not number or number.group(0) != raw_input:
        logging.warning("The quantity cleaning-script has removed input {}, not of decimal type".format(raw_input))
        return None
    else:
        return float(raw_input)
