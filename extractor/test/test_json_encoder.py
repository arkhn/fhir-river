from decimal import Decimal

from extractor.src.json_encoder import MyJSONEncoder


def test_encode_decimal():
    json_encoder = MyJSONEncoder()

    encoded = json_encoder.default(Decimal("5.0"))
    assert encoded == "5"

    encoded = json_encoder.default(Decimal("5"))
    assert encoded == "5"

    encoded = json_encoder.default(Decimal("5.1030000"))
    assert encoded == "5.103"
