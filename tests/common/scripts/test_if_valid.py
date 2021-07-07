from common.scripts.if_valid import if_valid
from common.scripts.make_title import make_title
from common.scripts.strip import strip


def test_if_logic():

    my_script = if_valid(strip, "Hello")

    row_input = ""
    assert my_script(row_input) == ""

    row_input = "holà"
    assert my_script(row_input) == "Hello"

    row_input = "NaN"
    assert my_script(row_input) == ""

    my_script = if_valid(strip, make_title)

    row_input = ""
    assert my_script(row_input) == ""

    row_input = "  holà"
    assert my_script(row_input) == "Holà"
