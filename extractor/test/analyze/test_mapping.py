import extractor.src.analyze.mapping as mapping
from extractor.src.analyze.sql_column import SqlColumn
from extractor.src.analyze.sql_join import SqlJoin


def test_build_squash_rules():
    cols = [
        "ADMISSIONS.LANGUAGE",
        "PATIENTS.DOD",
        "PATIENTS.SUBJECT_ID",
    ]  # NOTE: I use a list instead of a set to keep the order of elements
    joins = {SqlJoin(SqlColumn("PATIENTS", "SUBJECT_ID"), SqlColumn("ADMISSIONS", "SUBJECT_ID"))}
    table = "PATIENTS"

    actual = mapping.build_squash_rules(cols, joins, table)

    assert actual == ["PATIENTS", [["ADMISSIONS", []]]]
