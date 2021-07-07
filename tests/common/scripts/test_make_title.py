from common.scripts import make_title


def test_make_title():
    row_input = " my text  "
    output = make_title(row_input)
    assert output == "My Text"
