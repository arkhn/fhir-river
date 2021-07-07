import datetime
import re

from common.scripts import utils


def clean_date(raw_input):  # noqa: C901
    if not isinstance(raw_input, str):
        raw_input = str(raw_input)
    if utils.is_empty(raw_input):
        return ""

    date = None

    # Correct format
    try:  # nosec
        pattern = re.compile(
            r"([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)"
            r"(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3])"
            r":[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):"
            r"[0-5][0-9]|14:00)))?)?)?"
        )
        full_match = re.fullmatch(raw_input, pattern)
        date = datetime.datetime.strptime(full_match.group(0)[0:10], "%Y-%m-%d")
    except Exception:
        pass

    formats = [
        "%Y%m%d%H%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%d",
        "%Y%m%d",
        "%Y-%m",
        "%Y%m",
        "%Y",
    ]
    for fmt in formats:
        try:
            date = datetime.datetime.strptime(raw_input, fmt)
        except ValueError:
            continue

    if date is None:
        return raw_input

    # We only want the date
    return date.isoformat().split("T")[0]
