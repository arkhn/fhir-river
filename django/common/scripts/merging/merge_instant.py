from common.scripts.cleaning import clean_instant


def merge_instant(*args):
    """Merging script with a instant concatenation"""
    values = [v for v in args if v is not None]
    return clean_instant("T".join(values))
