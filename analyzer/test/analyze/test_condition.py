from analyzer.src.analyze.condition import Condition, CONDITION_FLAG
from analyzer.src.analyze.sql_column import SqlColumn


def test_check():
    # EQ
    cond = Condition("INCLUDE", SqlColumn("patients", "gender"), "EQ", "M")

    row = {(CONDITION_FLAG, ("patients", "gender")): "M"}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "gender")): "F"}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("patients", "gender"), "EQ", "M")

    row = {(CONDITION_FLAG, ("patients", "gender")): "M"}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "gender")): "F"}
    assert cond.check(row)

    # GT
    cond = Condition("INCLUDE", SqlColumn("patients", "age"), "GT", "5")

    row = {(CONDITION_FLAG, ("patients", "age")): 8}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age")): 3}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("patients", "age"), "GT", "5")

    row = {(CONDITION_FLAG, ("patients", "age")): 8}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age")): 3}
    assert cond.check(row)

    # NOTNULL
    cond = Condition("INCLUDE", SqlColumn("patients", "age"), "NOTNULL", "dummy")

    row = {(CONDITION_FLAG, ("patients", "age")): 8}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age")): None}
    assert not cond.check(row)

    # NULL
    cond = Condition("EXCLUDE", SqlColumn("patients", "age"), "NULL", "dummy")

    row = {(CONDITION_FLAG, ("patients", "age")): None}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "age")): 3}
    assert cond.check(row)
