from unittest import mock

from common.analyzer.sql_column import SqlColumn


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
def test_dataframe_column_name(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hashhash"

    col = SqlColumn("short", "name")
    assert col.dataframe_column_name() == "short_name_hashhash"

    col = SqlColumn("veryyyyyyyyyyyyyylong", "naaaaaaaaaaaame")
    assert col.dataframe_column_name() == "veryyyyyyy_aaaaaaaame_hashhash"
