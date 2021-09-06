def binary_to_bool_2(raw_input):
    """Map (0,1) to (True, False)"""
    mapping = {"0": True, "1": False}
    if raw_input in mapping.keys():
        return mapping[raw_input]
    else:
        return None
