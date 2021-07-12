def binary_to_bool_1(raw_input):
    """Map (0,1) to (False, True)"""
    mapping = {0: False, 1: True}
    if raw_input in mapping.keys():
        return mapping[raw_input]
    else:
        return None
