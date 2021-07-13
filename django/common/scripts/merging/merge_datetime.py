from common.scripts.cleaning import clean_dateTime


def merge_datetime(*args):
    """Merging script with a datetime concatenation"""
    values = [v for v in args if v is not None]
    return clean_dateTime("T".join(values))
