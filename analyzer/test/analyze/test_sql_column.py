from analyzer.src.analyze.sql_column import SqlColumn


def test_dataframe_column_name():
    col = SqlColumn("short", "name")
    assert col.dataframe_column_name() == "short_name"

    col = SqlColumn("veryyyyyyyyyyyyyylong", "naaaaaaaaaaaame")
    assert col.dataframe_column_name() == "veryyyyyyy_aaaaaaaame_de4c936d"
