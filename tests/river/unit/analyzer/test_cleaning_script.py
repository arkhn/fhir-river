from unittest import mock

from common.analyzer.cleaning_script import CleaningScript


def test_cleaning_script_init():
    cleaning_script = CleaningScript("map_gender")

    assert cleaning_script.name == "map_gender"
    assert cleaning_script.script.__name__ == "map_gender"


def capitalize(text):
    return text.upper()


@mock.patch("common.analyzer.cleaning_script.scripts.get_script", return_value=capitalize)
def test_cleaning_script_apply(_):
    cleaning_script = CleaningScript("capitalize")

    dataframe = {"pk_col": [1, 2, 3, 4], "df_col": ["alice", "bob", "carol", "denis"]}

    cleaned_col = cleaning_script.apply(dataframe["df_col"], dataframe["pk_col"], "primary_key")

    assert cleaned_col == ["ALICE", "BOB", "CAROL", "DENIS"]
