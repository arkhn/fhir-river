from common.scripts import CleaningScript
from common.scripts.cleaning import map_gender


def test_cleaning_script_init():
    cleaning_script = CleaningScript(name="map_gender", func=map_gender, description=None, category="cleaning")

    assert cleaning_script.name == "map_gender"
    assert cleaning_script.func.__name__ == "map_gender"


def capitalize(text):
    return text.upper()


def test_cleaning_script_apply():
    cleaning_script = CleaningScript(name="capitalize", func=capitalize, description=None, category="cleaning")

    dataframe = {"pk_col": [1, 2, 3, 4], "df_col": ["alice", "bob", "carol", "denis"]}

    cleaned_col = cleaning_script.apply(dataframe["df_col"], dataframe["pk_col"], "primary_key")

    assert cleaned_col == ["ALICE", "BOB", "CAROL", "DENIS"]
