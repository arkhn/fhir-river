from common.scripts.utils import is_empty


def select_first_not_empty(*args):
    """Merging script which select the first input not empty"""
    for arg in args:
        if not is_empty(arg):
            return arg
