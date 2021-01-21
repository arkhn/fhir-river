import common.analyzer.mapping as mapping
from common.analyzer.sql_column import SqlColumn
from common.analyzer.sql_join import SqlJoin


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
