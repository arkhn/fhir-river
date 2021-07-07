from common.scripts.map_gender import map_gender
from river.adapters.scripts_repository import Script
from river.common.analyzer.cleaning_script import CleaningScript


def test_cleaning_script_init():
    script = Script(name="map_gender", func=map_gender, description=None, category=None)
    cleaning_script = CleaningScript(script)

    assert cleaning_script.script.name == "map_gender"
    assert cleaning_script.script.func.__name__ == "map_gender"


def capitalize(text):
    return text.upper()


def test_cleaning_script_apply():
    script = Script(name="capitalize", func=capitalize, description=None, category=None)
    cleaning_script = CleaningScript(script)

    dataframe = {"pk_col": [1, 2, 3, 4], "df_col": ["alice", "bob", "carol", "denis"]}

    cleaned_col = cleaning_script.apply(dataframe["df_col"], dataframe["pk_col"], "primary_key")

    assert cleaned_col == ["ALICE", "BOB", "CAROL", "DENIS"]
