def string_to_bool(raw_input):
    """Convert ("True","true","TRUE") to (True).."""
    mapping = {
        "True": True,
        "False": False,
        "true": True,
        "false": False,
        "TRUE": True,
        "FALSE": False,
    }
    if raw_input in mapping.keys():
        return mapping[raw_input]
    else:
        return None
