from unittest import mock

from river.adapters.scripts_repository import Script
from river.common.analyzer.attribute import Attribute
from river.common.analyzer.cleaning_script import CleaningScript
from river.common.analyzer.concept_map import ConceptMap
from river.common.analyzer.condition import CONDITION_FLAG, Condition
from river.common.analyzer.input_group import InputGroup
from river.common.analyzer.merging_script import MergingScript
from river.common.analyzer.sql_column import SqlColumn
from river.transformer import dataframe


@mock.patch("river.common.analyzer.sql_column.hashlib.sha1")
def test_clean_data(mock_sha1, dict_map_gender, dict_map_code):
    cleaning_script = CleaningScript(Script(name="clean", func=lambda arg: arg.replace("dirty", ""), description=None))
    mock_sha1.return_value.hexdigest.return_value = "hash"

    data = {
        "PATIENTS_NAME_hash": ["alicedirty", "alicedirty", "alicedirty"],
        "PATIENTS_ID_hash": ["id1", "id1", "id1"],
        "PATIENTS_ID2_hash": ["id21", "id21", "id21"],
        "ADMISSIONS_LANGUAGE_hash": ["Mdirty", "Fdirty", "Fdirty"],
        "ADMISSIONS_ID_hash": ["ABCdirty", "DEFdirty", "GHIdirty"],
    }

    attr_name = Attribute("name")
    group = InputGroup(
        id_="id_name",
        attribute=attr_name,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME", cleaning_script=cleaning_script)],
    )
    attr_name.add_input_group(group)

    attr_id = Attribute("id")
    group = InputGroup(
        id_="id_id",
        attribute=attr_id,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "ID"), SqlColumn("PUBLIC", "PATIENTS", "ID2")],
        static_inputs=["null"],
    )
    attr_id.add_input_group(group)

    attr_language = Attribute("language")
    group = InputGroup(
        id_="id_language",
        attribute=attr_name,
        columns=[
            SqlColumn(
                "PUBLIC",
                "ADMISSIONS",
                "LANGUAGE",
                cleaning_script=cleaning_script,
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
                "PUBLIC",
                "ADMISSIONS",
                "ID",
                cleaning_script=cleaning_script,
                concept_map=ConceptMap(dict_map_code, "id_cm_code"),
            )
        ],
    )
    attr_admid.add_input_group(group)

    attributes = [attr_name, attr_id, attr_language, attr_admid]
    primary_key_column = SqlColumn("PUBLIC", "PATIENTS", "ID")

    cleaned_data = dataframe.clean_data(data, attributes, primary_key_column, "pk_val")

    expected = {
        ("name", "id_name", "PUBLIC_PATIENTS_NAME"): ["alice"],
        ("id", "id_id", "PUBLIC_PATIENTS_ID"): ["id1"],
        ("id", "id_id", "PUBLIC_PATIENTS_ID2"): ["id21"],
        ("language", "id_language", "PUBLIC_ADMISSIONS_LANGUAGE"): ["male", "female", "female"],
        ("code", "id_code", "PUBLIC_ADMISSIONS_ID"): ["abc", "def", "ghi"],
    }

    assert cleaned_data == expected


def test_merge_by_attributes():
    merging_script = MergingScript(
        Script(name="merge", func=lambda *args: "".join(arg for arg in args if arg), description=None)
    )
    attr_name = Attribute("name")
    group = InputGroup(id_="id_name", attribute=attr_name, columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME")])
    attr_name.add_input_group(group)

    attr_id = Attribute("id")
    group = InputGroup(
        id_="id_id",
        attribute=attr_id,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "ID"), SqlColumn("PUBLIC", "PATIENTS", "ID2")],
        static_inputs=["id"],
        merging_script=merging_script,
    )
    attr_id.add_input_group(group)

    attr_language = Attribute("language")
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_1",
            attribute=attr_language,
            columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_1")],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND_LANG"), "EQ", "true")],
        )
    )
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_2",
            attribute=attr_language,
            columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_2")],
            conditions=[Condition("EXCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND_LANG"), "EQ", "true")],
        )
    )
    attr_language.add_input_group(
        InputGroup(
            id_="not_reached", attribute=attr_language, columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_3")]
        )
    )

    attr_admid = Attribute("admid")
    group = InputGroup(id_="id_admid", attribute=attr_admid, columns=[SqlColumn("PUBLIC", "ADMISSIONS", "ID")])
    attr_admid.add_input_group(group)

    attr_static = Attribute("static")
    group = InputGroup(id_="static", attribute=attr_static, static_inputs=["static"])
    attr_static.add_input_group(group)

    data = {
        ("name", "id_name", "PUBLIC_PATIENTS_NAME"): ["bob"],
        ("id", "id_id", "PUBLIC_PATIENTS_ID"): ["id1"],
        ("id", "id_id", "PUBLIC_PATIENTS_ID2"): ["id21"],
        ("language", "id_language_1", "PUBLIC_ADMISSIONS_LANGUAGE_1"): ["lang1", "lang2", "lang3", "lang4"],
        ("language", "id_language_2", "PUBLIC_ADMISSIONS_LANGUAGE_2"): ["lang21", "lang22", "lang23", "lang24"],
        ("language", "id_language_3", "PUBLIC_ADMISSIONS_LANGUAGE_3"): ["lang31", "lang32", "lang33", "lang34"],
        ("admid", "id_admid", "PUBLIC_ADMISSIONS_ID"): ["hadmid1", "hadmid2", "hadmid3", "hadmid4"],
        (CONDITION_FLAG, "PUBLIC_ADMISSIONS_COND_LANG"): ["false"],
    }

    attributes = [attr_name, attr_id, attr_language, attr_admid, attr_static]

    actual = dataframe.merge_by_attributes(data, attributes, "pk")
    expected = {
        "name": ["bob"],
        "id": ["id1id21id"],
        "language": ["lang21", "lang22", "lang23", "lang24"],
        "admid": ["hadmid1", "hadmid2", "hadmid3", "hadmid4"],
        "static": ["static"],
    }

    assert actual == expected


def test_merge_by_attributes_with_condition_arrays():
    attr_language = Attribute("language")
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_1",
            attribute=attr_language,
            columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_1")],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND_LANG"), "EQ", "1")],
        ),
    )
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_2",
            attribute=attr_language,
            columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_2")],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND_LANG"), "EQ", "2")],
        )
    )

    data = {
        ("language", "id_language_1", "PUBLIC_ADMISSIONS_LANGUAGE_1"): ["lang1", "lang2", "lang3", "lang4"],
        ("language", "id_language_2", "PUBLIC_ADMISSIONS_LANGUAGE_2"): ["lang21", "lang22", "lang23", "lang24"],
        (CONDITION_FLAG, "PUBLIC_ADMISSIONS_COND_LANG"): ["2", "1", "1", "0"],
    }

    attributes = [attr_language]

    actual = dataframe.merge_by_attributes(data, attributes, "pk")
    expected = {"language": ["lang21", "lang2", "lang3", None]}

    assert actual == expected


def test_merge_by_attributes_static_input_with_condition_arrays():
    attr_language = Attribute("language")
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_1",
            attribute=attr_language,
            static_inputs=["ENGL"],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND_LANG"), "EQ", "1")],
        ),
    )

    data = {(CONDITION_FLAG, "PUBLIC_ADMISSIONS_COND_LANG"): ["2", "1", "1", "0"]}

    attributes = [attr_language]

    actual = dataframe.merge_by_attributes(data, attributes, "pk")
    expected = {"language": [None, "ENGL", "ENGL", None]}

    assert actual == expected
