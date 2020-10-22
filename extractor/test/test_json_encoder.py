from datetime import date, datetime
from decimal import Decimal

from extractor.src.json_encoder import MyJSONEncoder


def test_encode_decimal():
    encoded = MyJSONEncoder().default(Decimal("5.0"))
    assert encoded == 5.0

    encoded = MyJSONEncoder().default(Decimal("5"))
    assert encoded == 5.0


def test_encode_datetime():
    encoded = MyJSONEncoder().default(date(2020, 10, 10))
    assert encoded == "2020-10-10"

    encoded = MyJSONEncoder().default(datetime(2020, 10, 10, 12, 12, 12))
    assert encoded == "2020-10-10T12:12:12"
