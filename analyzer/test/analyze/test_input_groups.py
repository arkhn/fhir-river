from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.condition import Condition, CONDITION_FLAG
from analyzer.src.analyze.input_group import InputGroup
from analyzer.src.analyze.sql_column import SqlColumn


def test_add_condition():
    attr = Attribute("name", definition_id="code")
    group = InputGroup(id_="id", attribute=attr)

    c1 = Condition("INCLUDE", SqlColumn("patients", "gender", "public"), "EQ", "M")
    group.add_condition(c1)
    assert len(group.conditions) == 1
    assert group.conditions[0] == c1

    c2 = Condition("EXCLUDE", SqlColumn("patients", "subject_id", "public"), "EQ", "123")
    group.add_condition(c2)
    assert len(group.conditions) == 2
    assert group.conditions[1] == c2


def test_add_column():
    attr = Attribute("name", definition_id="code")
    group = InputGroup(id_="id", attribute=attr)

    c1 = SqlColumn("patients", "gender", "public")
    group.add_column(c1)
    assert len(group.columns) == 1
    assert group.columns[0] == c1

    c2 = Condition("EXCLUDE", SqlColumn("patients", "subject_id", "public"), "EQ", "123")
    group.add_column(c2)
    assert len(group.columns) == 2
    assert group.columns[1] == c2


def test_add_static_input():
    attr = Attribute("name", definition_id="code")
    group = InputGroup(id_="id", attribute=attr)

    i1 = "bob"
    group.add_static_input(i1)
    assert len(group.static_inputs) == 1
    assert group.static_inputs[0] == i1

    i2 = "alice"
    group.add_static_input(i2)
    assert len(group.static_inputs) == 2
    assert group.static_inputs[1] == i2


def test_check_conditions():
    attr = Attribute("name", definition_id="code")
    group = InputGroup(id_="id", attribute=attr)

    group.add_condition(Condition("INCLUDE", SqlColumn("patients", "gender", "public"), "EQ", "M"))
    group.add_condition(
        Condition("EXCLUDE", SqlColumn("patients", "subject_id", "public"), "GT", "123")
    )

    row = {
        (CONDITION_FLAG, ("patients", "gender")): ["M"],
        (CONDITION_FLAG, ("patients", "subject_id")): [123],
    }

    assert group.check_conditions(row)

    row = {
        (CONDITION_FLAG, ("patients", "gender")): ["M"],
        (CONDITION_FLAG, ("patients", "subject_id")): [124],
    }

    assert not group.check_conditions(row)
