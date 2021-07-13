from common.scripts import utils


def merge_insee(value1, value2):
    if not utils.is_empty(value1):
        insee = value1
    else:
        insee = value2
    return insee.strip()
