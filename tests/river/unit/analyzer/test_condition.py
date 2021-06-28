import pytest

from river.common.analyzer.condition import CONDITION_FLAG, CONDITION_RELATION_TO_FUNCTION, UNARY_RELATIONS, Condition
from river.common.analyzer.sql_column import SqlColumn

BINARY_RELATIONS = [rel for rel in CONDITION_RELATION_TO_FUNCTION.keys() if rel not in UNARY_RELATIONS]


def test_check():
    # EQ
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "gender"), "EQ", "M")

    row = {(CONDITION_FLAG, "public_patients_gender"): "M"}
    assert cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_gender"): "F"}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "gender"), "EQ", "M")

    row = {(CONDITION_FLAG, "public_patients_gender"): "M"}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_gender"): "F"}
    assert cond.check(row)

    # GT
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "GT", "5")

    row = {(CONDITION_FLAG, "public_patients_age"): 8}
    assert cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_age"): 3}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "age"), "GT", "5")

    row = {(CONDITION_FLAG, "public_patients_age"): 8}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_age"): 3}
    assert cond.check(row)

    # IN integers
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "IN", "2,4,6")

    row = {(CONDITION_FLAG, "public_patients_age"): 2}
    assert cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_age"): 3}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "age"), "IN", "2,4,6")

    row = {(CONDITION_FLAG, "public_patients_age"): 4}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_age"): 5}
    assert cond.check(row)

    # IN strings
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "name"), "IN", "bob,bill")

    row = {(CONDITION_FLAG, "public_patients_name"): "bill"}
    assert cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_name"): "alice"}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "name"), "IN", "bob,bill")

    row = {(CONDITION_FLAG, "public_patients_name"): "bob"}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_name"): "alice"}
    assert cond.check(row)

    # IN dates
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "bd"), "IN", "2020-02-02,2021-12-02")

    row = {(CONDITION_FLAG, "public_patients_bd"): "2020-02-02"}
    assert cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_bd"): "2020-02-03"}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "bd"), "IN", "2020-02-02,2021-12-02")

    row = {(CONDITION_FLAG, "public_patients_bd"): "2020-02-02"}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_bd"): "2020-02-03"}
    assert cond.check(row)

    # NOTNULL
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "NOTNULL", "dummy")

    row = {(CONDITION_FLAG, "public_patients_age"): 8}
    assert cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_age"): None}
    assert not cond.check(row)

    # NULL
    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "age"), "NULL", "dummy")

    row = {(CONDITION_FLAG, "public_patients_age"): None}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, "public_patients_age"): 3}
    assert cond.check(row)


@pytest.mark.parametrize("relation", BINARY_RELATIONS)
def test_check_include_with_none(relation):
    row = {(CONDITION_FLAG, "public_patients_gender"): None}

    cond = Condition("INCLUDE", SqlColumn("public", "patients", "gender"), relation, "M")
    assert not cond.check(row)


@pytest.mark.parametrize("relation", BINARY_RELATIONS)
def test_check_exclude_with_none(relation):
    row = {(CONDITION_FLAG, "public_patients_gender"): None}

    cond = Condition("EXCLUDE", SqlColumn("public", "patients", "gender"), relation, "M")
    assert cond.check(row)


def test_types():
    # String
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "gender"), "EQ", "M")

    row = {(CONDITION_FLAG, "public_patients_gender"): "M"}
    assert cond.check(row)

    # Int
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "EQ", "35")

    row = {(CONDITION_FLAG, "public_patients_age"): 35}
    assert cond.check(row)

    # Float
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "age"), "EQ", "35.5")

    row = {(CONDITION_FLAG, "public_patients_age"): 35.5}
    assert cond.check(row)

    # Bool
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "isAlive"), "EQ", "True")

    row = {(CONDITION_FLAG, "public_patients_isAlive"): True}
    assert cond.check(row)

    # Date
    cond = Condition("INCLUDE", SqlColumn("public", "patients", "birthDate"), "EQ", "2012-01-01")

    row = {(CONDITION_FLAG, "public_patients_birthDate"): "2012-01-01T00:00:00"}
    assert cond.check(row)

    cond = Condition("INCLUDE", SqlColumn("public", "patients", "birthDate"), "LT", "2012-02-01")

    row = {(CONDITION_FLAG, "public_patients_birthDate"): "2012-01-01T00:00:00"}
    assert cond.check(row)