from unittest import mock

from common.analyzer.attribute import Attribute
from common.analyzer.input_group import InputGroup


def test_cast_type_string():
    attr_str = Attribute("name", definition_id="code")
    group = InputGroup(id_="id", attribute=attr_str)
    group.add_static_input("string")

    assert group.static_inputs == ["string"]


def test_cast_type_no_scientific_notation():
    attr_int = Attribute("code", definition_id="code")
    group = InputGroup(id_="id", attribute=attr_int)
    group.add_static_input(100.0)

    assert group.static_inputs == ["100"]


def test_cast_type_number():
    attr_int = Attribute("age", definition_id="integer")
    group = InputGroup(id_="id", attribute=attr_int)
    group.add_static_input("123")

    assert group.static_inputs == [123]


@mock.patch("common.analyzer.attribute.logger")
def test_cast_type_fail(mock_logger):
    attr_str = Attribute("age", definition_id="integer")
    group = InputGroup(id_="id", attribute=attr_str)
    group.add_static_input("error")

    mock_logger.warning.assert_called_once()
    assert group.static_inputs == ["error"]
