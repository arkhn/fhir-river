from analyzer.src.analyze.attribute import Attribute


def test_cast_type():
    # To string
    attr_str = Attribute("name", definition_id="code")
    attr_str.add_static_input("string")

    assert attr_str.static_inputs == ["string"]

    # To number
    attr_int = Attribute("name", definition_id="integer")
    attr_int.add_static_input("123")

    assert attr_int.static_inputs == [123]