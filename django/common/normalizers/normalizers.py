from decimal import Decimal


def normalize_to_bool(value: str):
    if value.lower() in ("true", "1"):
        return True
    elif value.lower() in ("false", "0"):
        return False
    raise ValueError(f"cannot cast {value} to boolean")


def normalize_to_str(value):
    if isinstance(value, float):
        value = Decimal(value).normalize()
        return format(value, "f")
    return str(value)
