import pytest

from common.analyzer.condition import CONDITION_RELATION_TO_FUNCTION, UNARY_RELATIONS, Condition
from common.analyzer.sql_column import SqlColumn

BINARY_RELATIONS = [rel for rel in CONDITION_RELATION_TO_FUNCTION.keys() if rel not in UNARY_RELATIONS]


def test_check():
    # EQ
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "gender"), "EQ", "M")
    assert cond.check("M")
    assert not cond.check("F")

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "gender"), "EQ", "M")
    assert not cond.check("M")
    assert cond.check("F")

    # GT
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "GT", "5")
    assert cond.check(8)
    assert not cond.check(3)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "age"), "GT", "5")
    assert not cond.check(8)
    assert cond.check(3)

    # IN integers
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "IN", "2,4,6")
    assert cond.check(2)
    assert not cond.check(3)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "age"), "IN", "2,4,6")
    assert not cond.check(4)
    assert cond.check(5)

    # IN strings
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "name"), "IN", "bob,bill")
    assert cond.check("bill")
    assert not cond.check("alice")

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "name"), "IN", "bob,bill")
    assert not cond.check("bob")
    assert cond.check("alice")

    # IN dates
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "bd"), "IN", "2020-02-02,2021-12-02")
    assert cond.check("2020-02-02")
    assert not cond.check("2020-02-03")

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "bd"), "IN", "2020-02-02,2021-12-02")
    assert not cond.check("2020-02-02")
    assert cond.check("2020-02-03")

    # NOTNULL
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "NOTNULL", "dummy")
    assert cond.check(8)
    assert not cond.check(None)

    # NULL
    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "age"), "NULL", "dummy")
    assert not cond.check(None)
    assert cond.check(3)


@pytest.mark.parametrize("relation", BINARY_RELATIONS)
def test_check_include_with_none(relation):
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "gender"), relation, "M")
    assert not cond.check(None)


@pytest.mark.parametrize("relation", BINARY_RELATIONS)
def test_check_exclude_with_none(relation):
    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "gender"), relation, "M")
    assert cond.check(None)


def test_types():
    # String
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "gender"), "EQ", "M")
    assert cond.check("M")

    # Int
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "EQ", "35")
    assert cond.check(35)

    # Float
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "EQ", "35.5")
    assert cond.check(35.5)

    # Bool
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "isAlive"), "EQ", "True")
    assert cond.check(True)

    # Date
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "birthDate"), "EQ", "2012-01-01")
    assert cond.check("2012-01-01T00:00:00")

    cond = Condition("INCLUDE", SqlColumn("public", "patients", "birthDate"), "LT", "2012-02-01")
    assert cond.check("2012-01-01T00:00:00")
