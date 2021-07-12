import datetime

from common.scripts import utils


def clean_time(raw_input):  # noqa: C901
    if not isinstance(raw_input, str):
        raw_input = str(raw_input)
    if utils.is_empty(raw_input):
        return ""
    time = None

    formats = [
        "%H:%M:%S",
        "%H:%M:%S.%f",
        "%Y%m%d%H%M%S",
        "%Y%m%d%H%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%H:%M:%S%z",
        "%H::%M::%S",
        "%H %M %S",
        "%H%M%S",
        "%H%M",
    ]
    for fmt in formats:
        try:
            time = datetime.datetime.strptime(raw_input, fmt).time()
        except ValueError:
            pass

    if not time:
        return "00:00:00"

    return time.strftime("%H:%M:%S")
