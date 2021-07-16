import re

from common.scripts import utils


def clean_text_blob(raw_input):
    """Remove special charater from long BLOB / CLOB text"""
    if utils.is_empty(raw_input):
        return None

    text = (
        raw_input.replace("\x01", "")
        .replace("\x00", "")
        .replace("\x1a", "")
        .replace("'", "")
        .replace("\r", "\n")
        .replace("\\m0", "")
        .replace("\\m1", "")
        .replace("\\m2", "")
        .replace("\\m3", "")
        .replace("\\m8", "")
        .replace("\\\\", "")
        .replace("\\f", "\\\f")
    )

    if "\f:12" in text:
        x = re.findall("(.*)(?=\\f:[\\d]{5})", text)  # trouve ['\x0c:12152']
        y = re.findall("\\\f:[\\d]{5}\\\\?", text)
        text = text.replace(x[0], "").replace(y[0], "")  # enleve x

    return text
