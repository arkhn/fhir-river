def strip(raw_input):
    """Strip strings, convert NaN and None to empty string"""
    if raw_input is None or raw_input == "NaN":
        return ""
    return raw_input.strip()
