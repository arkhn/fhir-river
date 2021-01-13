import pytest

from analyzer.src.analyze.condition import (
    Condition,
    CONDITION_FLAG,
    CONDITION_RELATION_TO_FUNCTION,
    UNARY_RELATIONS,
)
from analyzer.src.analyze.sql_column import SqlColumn

BINARY_RELATIONS = [
    rel for rel in CONDITION_RELATION_TO_FUNCTION.keys() if rel not in UNARY_RELATIONS
]


def test_check():
    # EQ
    cond = Condition("INCLUDE", SqlColumn("patients", "gender", "public"), "EQ", "M")

    row = {(CONDITION_FLAG, ("patients", "gender", "public")): ["M"]}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "gender")): ["F"]}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("patients", "gender", "public"), "EQ", "M")

    row = {(CONDITION_FLAG, ("patients", "gender", "public")): ["M"]}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "gender", "public")): ["F"]}
    assert cond.check(row)

    # GT
    cond = Condition("INCLUDE", SqlColumn("patients", "age", "public"), "GT", "5")

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [8]}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [3]}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("patients", "age", "public"), "GT", "5")

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [8]}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [3]}
    assert cond.check(row)

    # NOTNULL
    cond = Condition("INCLUDE", SqlColumn("patients", "age", "public"), "NOTNULL", "dummy")

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [8]}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [None]}
    assert not cond.check(row)

    # NULL
    cond = Condition("EXCLUDE", SqlColumn("patients", "age", "public"), "NULL", "dummy")

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [None]}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [3]}
    assert cond.check(row)


@pytest.mark.parametrize("relation", BINARY_RELATIONS)
def test_check_include_with_none(relation):
    row = {(CONDITION_FLAG, ("patients", "gender")): [None]}

    cond = Condition("INCLUDE", SqlColumn("patients", "gender", "public"), relation, "M")
    assert not cond.check(row)


@pytest.mark.parametrize("relation", BINARY_RELATIONS)
def test_check_exclude_with_none(relation):
    row = {(CONDITION_FLAG, ("patients", "gender")): [None]}

    cond = Condition("EXCLUDE", SqlColumn("patients", "gender", "public"), relation, "M")
    assert cond.check(row)


def test_types():
    # String
    cond = Condition("INCLUDE", SqlColumn("patients", "gender", "public"), "EQ", "M")

    row = {(CONDITION_FLAG, ("patients", "gender", "public")): ["M"]}
    assert cond.check(row)

    # Int
    cond = Condition("INCLUDE", SqlColumn("patients", "age", "public"), "EQ", "35")

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [35]}
    assert cond.check(row)

    # Float
    cond = Condition("INCLUDE", SqlColumn("patients", "age", "public"), "EQ", "35.5")

    row = {(CONDITION_FLAG, ("patients", "age", "public")): [35.5]}
    assert cond.check(row)

    # Bool
    cond = Condition("INCLUDE", SqlColumn("patients", "isAlive", "public"), "EQ", "True")

    row = {(CONDITION_FLAG, ("patients", "isAlive", "public")): [True]}
    assert cond.check(row)

    # Date
    cond = Condition("INCLUDE", SqlColumn("patients", "birthDate", "public"), "EQ", "2012-01-01")

    row = {(CONDITION_FLAG, ("patients", "birthDate", "public")): ["2012-01-01T00:00:00"]}
    assert cond.check(row)

    cond = Condition("INCLUDE", SqlColumn("patients", "birthDate", "public"), "LT", "2012-02-01")

    row = {(CONDITION_FLAG, ("patients", "birthDate", "public")): ["2012-01-01T00:00:00"]}
    assert cond.check(row)
