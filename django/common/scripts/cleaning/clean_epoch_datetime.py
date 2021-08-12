import datetime
import re

from common.scripts import utils


def clean_epoch_dateTime(raw_input):
    # Handle epoch
    try:
        if len(raw_input) == 8:
            date = datetime.datetime.fromtimestamp(float(raw_input))
        elif len(raw_input) == 13:
            date = datetime.datetime.fromtimestamp(float(raw_input) / 1000)
        date_with_tz = date.replace(tzinfo=datetime.timezone(datetime.timedelta(hours=2)))
        result = date_with_tz.isoformat()
    except ValueError:
        pass

    if date is None:
        return raw_input

    return result
