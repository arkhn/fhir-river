import datetime

from common.scripts import utils


def clean_epoch_dateTime(raw_input):

    if utils.is_empty(raw_input):
        return ""

    # Handle epoch
    try:
        if len(raw_input) < 12:
            date = datetime.datetime.fromtimestamp(float(raw_input))
        else:
            date = datetime.datetime.fromtimestamp(float(raw_input) / 1000)
        date_with_tz = date.replace(tzinfo=datetime.timezone(datetime.timedelta(hours=2)))
        return date_with_tz.isoformat()
    except ValueError:
        return ""
