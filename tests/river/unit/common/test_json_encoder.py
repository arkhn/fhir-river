from datetime import date, datetime
from decimal import Decimal

from utils.json import CustomJSONEncoder


def test_encode_decimal():
    encoded = CustomJSONEncoder().default(Decimal("5.0"))
    assert encoded == 5.0

    encoded = CustomJSONEncoder().default(Decimal("5"))
    assert encoded == 5.0


def test_encode_datetime():
    encoded = CustomJSONEncoder().default(date(2020, 10, 10))
    assert encoded == "2020-10-10"

    encoded = CustomJSONEncoder().default(datetime(2020, 10, 10, 12, 12, 12))
    assert encoded == "2020-10-10T12:12:12"
