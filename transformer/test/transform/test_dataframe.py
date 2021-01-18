from unittest import mock, TestCase

from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.cleaning_script import CleaningScript
from analyzer.src.analyze.concept_map import ConceptMap
from analyzer.src.analyze.condition import Condition, CONDITION_FLAG
from analyzer.src.analyze.input_group import InputGroup
from analyzer.src.analyze.merging_script import MergingScript
from analyzer.src.analyze.sql_column import SqlColumn

import transformer.src.transform.dataframe as transform


def mock_get_script(*args):
    if len(args) == 1:
        return args[0].replace("dirty", "")
    elif len(args) == 2:
        return args[0]
    else:
        return args[0] + args[1] + "merge"


@mock.patch("analyzer.src.analyze.sql_column.hashlib.sha1")
@mock.patch("analyzer.src.analyze.cleaning_script.scripts.get_script", return_value=mock_get_script)
def test_clean_data(_, mock_sha1, dict_map_gender, dict_map_code):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    data = {
        "PATIENTS_NAME_hash": ["alicedirty", "bobdirty", "charliedirty"],
        "PATIENTS_ID_hash": ["id1", "id2", "id3"],
        "PATIENTS_ID2_hash": ["id21", "id22", "id23"],
        "ADMISSIONS_LANGUAGE_hash": ["Mdirty", "Fdirty", "Fdirty"],
        "ADMISSIONS_ID_hash": ["ABCdirty", "DEFdirty", "GHIdirty"],
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
        columns=[
            SqlColumn(
                "ADMISSIONS",
                "LANGUAGE",
                cleaning_script=CleaningScript("clean1"),
                concept_map=ConceptMap(dict_map_gender, "id_cm_gender"),
            )
        ],
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
                concept_map=ConceptMap(dict_map_code, "id_cm_code"),
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
        columns[0]: ["alice", "bob", "charlie"],
        columns[1]: ["id1", "id2", "id3"],
        columns[2]: ["id21", "id22", "id23"],
        columns[3]: ["male", "female", "female"],
        columns[4]: ["abc", "def", "ghi"],
    }

    assert cleaned_data == expected


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
        "name": ("bob",),
        "id": ("id1id21merge",),
        "language": (("lang21", "lang22", "lang23", "lang24"),),
        "admid": (("hadmid1", "hadmid2", "hadmid3", "hadmid4"),),
    }

    assert actual == expected
