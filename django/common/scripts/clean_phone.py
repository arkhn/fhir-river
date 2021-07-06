import re


def clean_phone(raw_input):
    pattern = re.compile(r'"(\d{2})" + "[\.\-\s]*(\d{2})" * 4')  # noqa
    occurrences = pattern.findall(raw_input)
    if len(occurrences) > 0:
        phone = " ".join(occurrences[0])
        return phone
    return ""
