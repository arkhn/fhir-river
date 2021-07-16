from common.scripts.cleaning import clean_instant


def merge_instant(*args):
    """Merging script with a instant concatenation"""
    if len(args) > 2 or len(args) == 0:
        raise ValueError("merge_instant must have [1,2] arguments")

    values = [v for v in args if v is not None]
    return clean_instant("T".join(values))
