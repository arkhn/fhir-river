def merge_concat(*args):
    """Merging script with a simple concatenation and a " " separator"""
    # TODO: rename this script in concat_with_space_separator when refacto
    values = [str(v) for v in args if v is not None]
    separator = " "
    return separator.join(values)
