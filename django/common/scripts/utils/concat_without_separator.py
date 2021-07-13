def concat_without_separator(*args):
    """Merging script with a simple concatenation, no separator"""
    values = [str(v) for v in args if v is not None]
    separator = ""
    return separator.join(values)
