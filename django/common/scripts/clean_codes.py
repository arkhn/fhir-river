import re

from common.scripts import utils

codeTypes = [
    "HL7",
    "UMLS",
    "LOINC",
    "ATC",
    "FINESS",
    "MedDRA",
    "CIM10",
    "RECIST",
    "OSIRIS",
    "ICDO3",
    "ICD-O-3",
]


def clean_codes(raw_input):
    """Remove terminology system from code ("HL7:male") to ("male")"""
    if utils.is_empty(raw_input):
        return None

    code = re.match(r"([A-z0-9\-]*)( *: *)(.*)", raw_input)

    if not code or code.group(1) not in codeTypes:
        return raw_input
    else:
        return code.group(3)
