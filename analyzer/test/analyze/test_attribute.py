from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.input_group import InputGroup


def test_cast_type():
    # To string
    attr_str = Attribute("name", definition_id="code")
    group = InputGroup(id_="id", attribute=attr_str)
    group.add_static_input("string")

    assert group.static_inputs == ["string"]

    # To number
    attr_int = Attribute("name", definition_id="integer")
    group = InputGroup(id_="id", attribute=attr_int)
    group.add_static_input("123")

    assert group.static_inputs == [123]
