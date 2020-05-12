from unittest import mock, TestCase

import transformer.src.transform.dataframe as transform
from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.concept_map import ConceptMap
from analyzer.src.analyze.cleaning_script import CleaningScript
from analyzer.src.analyze.merging_script import MergingScript

from transformer.test.conftest import mock_fetch_maps


def mock_get_script(*args):
    if len(args) == 1:
        return args[0] + "cleaned"
    elif len(args) == 2:
        return args[0]
    else:
        return args[0] + args[1] + "merge"


@mock.patch("analyzer.src.analyze.cleaning_script.scripts.get_script", return_value=mock_get_script)
@mock.patch("analyzer.src.analyze.ConceptMap.fetch", mock_fetch_maps)
def test_clean_data(_):
    data = {
        "PATIENTS_NAME": ["alice", "bob", "charlie"],
        "PATIENTS_ID": ["id1", "id2", "id3"],
        "PATIENTS_ID2": ["id21", "id22", "id23"],
        "ADMISSIONS_LANGUAGE": ["M", "F", "F"],
        "ADMISSIONS_ID": ["ABC", "DEF", "GHI"],
    }

    attr_name = Attribute(
        "name", columns=[SqlColumn("PATIENTS", "NAME", cleaning_script=CleaningScript("clean1"),)]
    )
    attr_id = Attribute(
        "id",
        columns=[SqlColumn("PATIENTS", "ID"), SqlColumn("PATIENTS", "ID2")],
        static_inputs=["null"],
    )
    attr_language = Attribute(
        "language",
        columns=[SqlColumn("ADMISSIONS", "LANGUAGE", concept_map=ConceptMap("id_cm_gender"))],
        static_inputs=["val"],
    )
    attr_admid = Attribute(
        "code",
        columns=[
            SqlColumn(
                "ADMISSIONS",
                "ID",
                cleaning_script=CleaningScript("clean2"),
                concept_map=ConceptMap("id_cm_code"),
            )
        ],
    )
    attributes = [attr_name, attr_id, attr_language, attr_admid]
    primary_key_column = SqlColumn("PATIENTS", "ID")

    cleaned_data = transform.clean_data(data, attributes, primary_key_column)

    columns = [
        ("name", ("PATIENTS", "NAME")),
        ("id", ("PATIENTS", "ID")),
        ("id", ("PATIENTS", "ID2")),
        ("language", ("ADMISSIONS", "LANGUAGE")),
        ("code", ("ADMISSIONS", "ID")),
    ]

    expected = {
        columns[0]: ["alicecleaned", "bobcleaned", "charliecleaned"],
        columns[1]: ["id1", "id2", "id3"],
        columns[2]: ["id21", "id22", "id23"],
        columns[3]: ["male", "female", "female"],
        columns[4]: ["abc", "def", "ghi"],
    }

    assert cleaned_data == expected


def test_squash_rows():
    data = {
        ("name", ("PATIENTS", "NAME")): ["bob", "bob", "bob", "bob"],
        ("id", ("PATIENTS", "ID")): ["id1", "id1", "id1", "id1"],
        ("id", ("PATIENTS", "ID2")): ["id21", "id21", "id21", "id21"],
        ("language", ("ADMISSIONS", "LANGUAGE")): ["lang1", "lang2", "lang3", "lang4"],
        ("code", ("ADMISSIONS", "ID")): ["id1", "id2", "id3", "id4"],
    }
    squash_rules = ["PATIENTS", [["ADMISSIONS", []]]]

    actual = transform.squash_rows(data, squash_rules)

    assert actual[("name", ("PATIENTS", "NAME"))] == "bob"
    assert actual[("id", ("PATIENTS", "ID"))] == "id1"
    assert actual[("id", ("PATIENTS", "ID2"))] == "id21"
    TestCase().assertCountEqual(
        zip(
            actual[("language", ("ADMISSIONS", "LANGUAGE"))], actual[("code", ("ADMISSIONS", "ID"))]
        ),
        (("lang1", "id1"), ("lang2", "id2"), ("lang3", "id3"), ("lang4", "id4")),
    )


@mock.patch("analyzer.src.analyze.merging_script.scripts.get_script", return_value=mock_get_script)
def test_merge_attributes(_):
    attr_name = Attribute("name", columns=[SqlColumn("PATIENTS", "NAME")])
    attr_id = Attribute(
        "id",
        columns=[SqlColumn("PATIENTS", "ID"), SqlColumn("PATIENTS", "ID2")],
        static_inputs=["unknown"],
        merging_script=MergingScript("merge"),
    )
    attr_language = Attribute("language", columns=[SqlColumn("ADMISSIONS", "LANGUAGE")])
    attr_admid = Attribute("admid", columns=[SqlColumn("ADMISSIONS", "ID")])

    data = {
        ("name", ("PATIENTS", "NAME")): "bob",
        ("id", ("PATIENTS", "ID")): "id1",
        ("id", ("PATIENTS", "ID2")): "id21",
        ("language", ("ADMISSIONS", "LANGUAGE")): ("lang1", "lang2", "lang3", "lang4"),
        ("admid", ("ADMISSIONS", "ID")): ("hadmid1", "hadmid2", "hadmid3", "hadmid4"),
    }

    attributes = [attr_name, attr_id, attr_language, attr_admid]

    actual = transform.merge_attributes(data, attributes, "pk")
    expected = {
        "name": "bob",
        "id": "id1id21merge",
        "language": ("lang1", "lang2", "lang3", "lang4"),
        "admid": ("hadmid1", "hadmid2", "hadmid3", "hadmid4"),
    }

    assert actual == expected
