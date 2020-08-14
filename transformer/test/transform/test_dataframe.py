from unittest import mock, TestCase

from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.cleaning_script import CleaningScript
from analyzer.src.analyze.concept_map import ConceptMap
from analyzer.src.analyze.condition import Condition, CONDITION_FLAG
from analyzer.src.analyze.input_group import InputGroup
from analyzer.src.analyze.merging_script import MergingScript
from analyzer.src.analyze.sql_column import SqlColumn

import transformer.src.transform.dataframe as transform

from transformer.test.conftest import mock_fetch_maps


def mock_get_script(*args):
    if len(args) == 1:
        return args[0] + "cleaned"
    elif len(args) == 2:
        return args[0]
    else:
        return args[0] + args[1] + "merge"


def test_cast_types():
    data = {
        "PATIENTS_NAME": ["alice", "bob", "charlie"],
        "PATIENTS_ID": ["1", "2", "3"],
        "PATIENTS_ID2": ["11", "22", "33"],
    }

    attr_str = Attribute("str", definition_id="code")
    group = InputGroup(
        id_="id",
        attribute=attr_str,
        columns=[SqlColumn("PATIENTS", "NAME", cleaning_script=CleaningScript("clean1"))],
    )
    attr_str.add_input_group(group)

    attr_number = Attribute("number", definition_id="integer")
    group = InputGroup(
        id_="id",
        attribute=attr_str,
        columns=[SqlColumn("PATIENTS", "ID"), SqlColumn("PATIENTS", "ID2")],
    )
    attr_number.add_input_group(group)

    cast_data = transform.cast_types(data, [attr_str, attr_number])

    assert cast_data == {
        "PATIENTS_NAME": ["alice", "bob", "charlie"],
        "PATIENTS_ID": [1, 2, 3],
        "PATIENTS_ID2": [11, 22, 33],
    }


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

    attr_name = Attribute("name")
    group = InputGroup(
        id_="id_name",
        attribute=attr_name,
        columns=[SqlColumn("PATIENTS", "NAME", cleaning_script=CleaningScript("clean1"))],
    )
    attr_name.add_input_group(group)

    attr_id = Attribute("id")
    group = InputGroup(
        id_="id_id",
        attribute=attr_id,
        columns=[SqlColumn("PATIENTS", "ID"), SqlColumn("PATIENTS", "ID2")],
        static_inputs=["null"],
    )
    attr_id.add_input_group(group)

    attr_language = Attribute("language")
    group = InputGroup(
        id_="id_language",
        attribute=attr_name,
        columns=[SqlColumn("ADMISSIONS", "LANGUAGE", concept_map=ConceptMap("id_cm_gender"))],
        static_inputs=["val"],
    )
    attr_language.add_input_group(group)

    attr_admid = Attribute("code")
    group = InputGroup(
        id_="id_code",
        attribute=attr_name,
        columns=[
            SqlColumn(
                "ADMISSIONS",
                "ID",
                cleaning_script=CleaningScript("clean2"),
                concept_map=ConceptMap("id_cm_code"),
            )
        ],
    )
    attr_admid.add_input_group(group)

    attributes = [attr_name, attr_id, attr_language, attr_admid]
    primary_key_column = SqlColumn("PATIENTS", "ID")

    cleaned_data = transform.clean_data(data, attributes, primary_key_column)

    columns = [
        ("id_name", ("PATIENTS", "NAME")),
        ("id_id", ("PATIENTS", "ID")),
        ("id_id", ("PATIENTS", "ID2")),
        ("id_language", ("ADMISSIONS", "LANGUAGE")),
        ("id_code", ("ADMISSIONS", "ID")),
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
    squash_rules = ["PATIENTS", [["ADMISSIONS", [["dummy", []]]]]]

    actual = transform.squash_rows(data, squash_rules)

    assert actual[("name", ("PATIENTS", "NAME"))] == ["bob"]
    assert actual[("id", ("PATIENTS", "ID"))] == ["id1"]
    assert actual[("id", ("PATIENTS", "ID2"))] == ["id21"]
    TestCase().assertCountEqual(
        zip(
            actual[("language", ("ADMISSIONS", "LANGUAGE"))][0],
            actual[("code", ("ADMISSIONS", "ID"))][0],
        ),
        (("lang1", "id1"), ("lang2", "id2"), ("lang3", "id3"), ("lang4", "id4")),
    )

    # Test without squash rules
    data = {
        ("name", ("PATIENTS", "NAME")): ["bob", "bob", "bob", "bob"],
        ("id", ("PATIENTS", "ID")): ["id1", "id1", "id1", "id1"],
        ("id", ("PATIENTS", "ID2")): ["id21", "id21", "id21", "id21"],
    }
    squash_rules = ["PATIENTS", []]

    actual = transform.squash_rows(data, squash_rules)

    assert actual == data


@mock.patch("analyzer.src.analyze.merging_script.scripts.get_script", return_value=mock_get_script)
def test_merge_by_attributes(_):
    attr_name = Attribute("name")
    group = InputGroup(id_="id_name", attribute=attr_name, columns=[SqlColumn("PATIENTS", "NAME")])
    attr_name.add_input_group(group)

    attr_id = Attribute("id")
    group = InputGroup(
        id_="id_id",
        attribute=attr_id,
        columns=[SqlColumn("PATIENTS", "ID"), SqlColumn("PATIENTS", "ID2")],
        static_inputs=["unknown"],
        merging_script=MergingScript("merge"),
    )
    attr_id.add_input_group(group)

    attr_language = Attribute("language")
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_1",
            attribute=attr_language,
            columns=[SqlColumn("ADMISSIONS", "LANGUAGE_1")],
            conditions=[Condition("INCLUDE", SqlColumn("ADMISSIONS", "COND_LANG"), "EQ", "true")],
        )
    )
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_2",
            attribute=attr_language,
            columns=[SqlColumn("ADMISSIONS", "LANGUAGE_2")],
            conditions=[Condition("EXCLUDE", SqlColumn("ADMISSIONS", "COND_LANG"), "EQ", "true")],
        )
    )
    attr_language.add_input_group(
        InputGroup(
            id_="not_reached",
            attribute=attr_language,
            columns=[SqlColumn("ADMISSIONS", "LANGUAGE_3")],
        )
    )

    attr_admid = Attribute("admid")
    group = InputGroup(
        id_="id_admid", attribute=attr_admid, columns=[SqlColumn("ADMISSIONS", "ID")],
    )
    attr_admid.add_input_group(group)

    data = {
        ("id_name", ("PATIENTS", "NAME")): ["bob"],
        ("id_id", ("PATIENTS", "ID")): ["id1"],
        ("id_id", ("PATIENTS", "ID2")): ["id21"],
        ("id_language_1", ("ADMISSIONS", "LANGUAGE_1")): [("lang1", "lang2", "lang3", "lang4")],
        ("id_language_2", ("ADMISSIONS", "LANGUAGE_2")): [("lang21", "lang22", "lang23", "lang24")],
        ("id_language_3", ("ADMISSIONS", "LANGUAGE_3")): [("lang31", "lang32", "lang33", "lang34")],
        ("id_admid", ("ADMISSIONS", "ID")): [("hadmid1", "hadmid2", "hadmid3", "hadmid4")],
        (CONDITION_FLAG, ("ADMISSIONS", "COND_LANG")): ["false"],
    }

    attributes = [attr_name, attr_id, attr_language, attr_admid]

    actual = transform.merge_by_attributes(data, attributes, "pk")
    expected = {
        "name": "bob",
        "id": "id1id21merge",
        "language": ("lang21", "lang22", "lang23", "lang24"),
        "admid": ("hadmid1", "hadmid2", "hadmid3", "hadmid4"),
    }

    assert actual == expected
