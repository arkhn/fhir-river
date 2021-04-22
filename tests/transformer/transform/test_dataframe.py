from unittest import mock

from common.analyzer.attribute import Attribute
from common.analyzer.cleaning_script import CleaningScript
from common.analyzer.concept_map import ConceptMap
from common.analyzer.condition import Condition
from common.analyzer.input_group import InputGroup
from common.analyzer.merging_script import MergingScript
from common.analyzer.sql_column import SqlColumn
from transformer.transform import dataframe


def mock_get_script(name):
    if name == "merge":
        return lambda *args: "".join(arg for arg in args if arg)
    elif name == "clean":
        return lambda arg: arg.replace("dirty", "")


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("common.analyzer.cleaning_script.scripts.get_script", mock_get_script)
def test_clean_data(mock_sha1, dict_map_gender, dict_map_code):
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
        columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME", cleaning_script=CleaningScript("clean"))],
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
                cleaning_script=CleaningScript("clean"),
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
                cleaning_script=CleaningScript("clean"),
                concept_map=ConceptMap(dict_map_code, "id_cm_code"),
            )
        ],
    )
    attr_admid.add_input_group(group)

    attributes = [attr_name, attr_id, attr_language, attr_admid]
    primary_key_column = SqlColumn("PUBLIC", "PATIENTS", "ID")

    cleaned_data = dataframe.clean_data(data, attributes, primary_key_column, "pk_val")

    columns = [
        ("name", "id_name", "PUBLIC_PATIENTS_NAME"),
        ("id", "id_id", "PUBLIC_PATIENTS_ID"),
        ("id", "id_id", "PUBLIC_PATIENTS_ID2"),
        ("language", "id_language", "PUBLIC_ADMISSIONS_LANGUAGE"),
        ("code", "id_code", "PUBLIC_ADMISSIONS_ID"),
    ]

    expected = {
        columns[0]: ["alice"],
        columns[1]: ["id1"],
        columns[2]: ["id21"],
        columns[3]: ["male", "female", "female"],
        columns[4]: ["abc", "def", "ghi"],
    }

    assert cleaned_data == expected


# TODO tests filter_with_conditions


@mock.patch("common.analyzer.merging_script.scripts.get_script", mock_get_script)
def test_merge_by_attributes():
    attr_name = Attribute("name")
    group = InputGroup(id_="id_name", attribute=attr_name, columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME")])
    attr_name.add_input_group(group)

    attr_id = Attribute("id")
    group = InputGroup(
        id_="id_id",
        attribute=attr_id,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "ID"), SqlColumn("PUBLIC", "PATIENTS", "ID2")],
        static_inputs=["unknown"],
        merging_script=MergingScript("merge"),
    )
    attr_id.add_input_group(group)

    attr_language = Attribute("language")
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_1",
            attribute=attr_language,
            columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_1"), SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_2")],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND_LANG"), "EQ", "true")],
            merging_script=MergingScript("merge"),
        )
    )
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_2", attribute=attr_language, columns=[SqlColumn("PUBLIC", "ADMISSIONS", "LANGUAGE_2")]
        )
    )

    attr_admid = Attribute("admid")
    group = InputGroup(id_="id_admid", attribute=attr_admid, columns=[SqlColumn("PUBLIC", "ADMISSIONS", "ID")])
    attr_admid.add_input_group(group)

    attr_static = Attribute("static")
    group = InputGroup(id_="static", attribute=attr_static, static_inputs=["static"])
    attr_static.add_input_group(group)

    data = {
        ("name", "id_name"): [["bob"]],
        ("id", "id_id"): [["id1"], ["id21"], ["null"]],
        ("language", "id_language_1"): [[None], ["lang21", "lang22", "lang23", "lang24"]],
        ("language", "id_language_2"): [["lang31", "lang32", "lang33", "lang34"]],
        ("admid", "id_admid"): [["hadmid1", "hadmid2", "hadmid3", "hadmid4"]],
        ("static", "static"): [["static"]],
    }

    attributes = [attr_name, attr_id, attr_language, attr_admid, attr_static]

    actual = dataframe.merge_by_attributes(data, attributes, "pk")
    expected = {
        "name": ["bob"],
        "id": ["id1id21null"],
        "language": ["lang21", "lang22", "lang23", "lang24"],
        "admid": ["hadmid1", "hadmid2", "hadmid3", "hadmid4"],
        "static": ["static"],
    }

    assert actual == expected
