from common.scripts import strip


def test_clean_identity():
    assert strip(None) == ""
    assert strip("NaN") == ""
    row_input = "Holà chicanos"
    assert strip(row_input) == row_input
