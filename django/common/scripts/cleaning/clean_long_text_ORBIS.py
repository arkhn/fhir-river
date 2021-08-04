import re

from common.scripts import utils


def clean_long_text_ORBIS(raw_input):
    """Remove special charater from long BLOB / CLOB text in ORBIS"""
    if utils.is_empty(raw_input):
        return None

    text = (
        raw_input.replace("\x01", "")
        .replace("\x00", "")
        .replace("\x1a", "")
        .replace("\x03", "")
        .replace("\x0c", "")
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

    if "\f:20" in text:
        x = re.findall("(.*)(?=\\f:[\\d]{4})", text)
        y = re.findall("\\\f:[\\d]{4}\\\\?", text)
        text = text.replace(x[0], "").replace(y[0], "")

    if text[0].isalpha() == True:
        if text[1].isalpha() == False:
            x = re.findall("^(.{2})", text)
            text = text.replace(x[0], "")

    if text[0].isalpha() == False:
        if text[1].isalpha() == True:
            x = re.findall("^(.{2})", text)
            text = text.replace(x[0], "")

    if "\f:12" in text:
        x = re.findall("(.*)(?=\\f:[\\d]{5})", text)
        y = re.findall("\\\f:[\\d]{5}\\\\?", text)
        text = text.replace(x[0], "").replace(y[0], "")

    return text
