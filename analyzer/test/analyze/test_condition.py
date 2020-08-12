from analyzer.src.analyze.condition import Condition, CONDITION_FLAG
from analyzer.src.analyze.sql_column import SqlColumn


def test_check():
    cond = Condition("INCLUDE", SqlColumn("patients", "gender"), "M")

    row = {(CONDITION_FLAG, ("patients", "gender")): "M"}
    assert cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "gender")): "F"}
    assert not cond.check(row)

    cond = Condition("EXCLUDE", SqlColumn("patients", "gender"), "M")

    row = {(CONDITION_FLAG, ("patients", "gender")): "M"}
    assert not cond.check(row)

    row = {(CONDITION_FLAG, ("patients", "gender")): "F"}
    assert cond.check(row)
