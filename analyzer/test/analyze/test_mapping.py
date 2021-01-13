import analyzer.src.analyze.mapping as mapping
from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.sql_join import SqlJoin


def test_build_squash_rules():
    joins = {
        SqlJoin(
            SqlColumn("PATIENTS", "SUBJECT_ID", "PUBLIC"),
            SqlColumn("ADMISSIONS", "SUBJECT_ID", "PUBLIC"),
        )
    }
    table = "PATIENTS"

    actual = mapping.build_squash_rules(joins, table)

    assert actual == ["PATIENTS", [["ADMISSIONS", []]]]
