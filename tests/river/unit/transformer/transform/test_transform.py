from unittest import mock

import pytest

from river.common.analyzer.analysis import Analysis
from river.common.analyzer.attribute import Attribute
from river.common.analyzer.cleaning_script import CleaningScript
from river.common.analyzer.concept_map import ConceptMap
from river.common.analyzer.condition import Condition
from river.common.analyzer.input_group import InputGroup
from river.common.analyzer.merging_script import MergingScript
from river.common.analyzer.sql_column import SqlColumn
from river.transformer.transformer import Transformer, compute_fhir_object_id


def mock_get_script(name):
    if name == "merge":
        return lambda *args: "".join(arg for arg in args if arg)
    elif name == "clean":
        return lambda arg: arg.replace("dirty", "")


def mock_uuid5(*args):
    return f"{args[0]}{args[1]}"


@mock.patch("river.common.analyzer.cleaning_script.get_script", mock_get_script)
@mock.patch("river.common.analyzer.merging_script.get_script", mock_get_script)
def test_transform(dict_map_code):

    data = {
        "PATIENTS_NAME_d944efcb": ["alicedirty", "alicedirty", "alicedirty"],
        "PATIENTS_ID_0f208c2f": ["id1", "id1", "id1"],
        "PATIENTS_ID2_hash": ["id21", "id21", "id21"],
        "ADMISSIONS_CODE_3596e6e0": ["ABCdirty", "ABCdirty", "DEFdirty"],
    }

    attr_name = Attribute("name")
    group = InputGroup(
        id_="id_name",
        attribute=attr_name,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME", cleaning_script=CleaningScript("clean"))],
    )
    attr_name.add_input_group(group)

    attr_language = Attribute("language[0].code")
    group = InputGroup(
        id_="id_language",
        attribute=attr_name,
        columns=[
            SqlColumn(
                "PUBLIC",
                "ADMISSIONS",
                "CODE",
                cleaning_script=CleaningScript("clean"),
                concept_map=ConceptMap(dict_map_code, "id_cm_gender"),
            )
        ],
        static_inputs=["val"],
        merging_script=MergingScript("merge"),
    )
    attr_language.add_input_group(group)

    attr_static = Attribute("static")
    group = InputGroup(id_="static", attribute=attr_static, static_inputs=["static"])
    attr_static.add_input_group(group)

    attr_static_list = Attribute("static_list[0]")
    group = InputGroup(id_="static_list", attribute=attr_static_list, static_inputs=["static_list"])
    attr_static_list.add_input_group(group)

    analysis = Analysis()
    analysis.attributes = [attr_name, attr_language, attr_static, attr_static_list]
    analysis.primary_key_column = SqlColumn("PUBLIC", "PATIENTS", "ID")
    analysis.definition = {"type": "Patient"}
    analysis.logical_reference = "9a07bc7d-1e7b-46ff-afd5-f9356255b2f6"

    primary_key_value = data[analysis.primary_key_column.dataframe_column_name()][0]

    transformer = Transformer()
    transformed = transformer.transform_data(data, analysis, primary_key_value)
    actual = transformer.create_fhir_document(transformed, analysis, primary_key_value)

    assert actual == {
        "id": actual["id"],
        "meta": actual["meta"],
        "name": "alice",
        "language": [{"code": "abcval"}, {"code": "abcval"}, {"code": "defval"}],
        "static": "static",
        "static_list": ["static_list"],
        "resourceType": "Patient",
    }


@mock.patch("river.common.analyzer.cleaning_script.get_script", mock_get_script)
def test_transform_with_condition_arrays(dict_map_code):
    data = {
        "PATIENTS_NAME_d944efcb": ["alicedirty", "alicedirty", "alicedirty"],
        "PATIENTS_ID_0f208c2f": ["id1", "id1", "id1"],
        "PATIENTS_ID2_hash": ["id21", "id21", "id21"],
        "ADMISSIONS_SYSTEM_a42b38e1": ["SYS", "SYS", "SYS"],
        "ADMISSIONS_CODE_1_25a91be2": ["abc", "abc", "def"],
        "ADMISSIONS_CODE_2_544ec6f3": ["cba", "cba", "fed"],
        "ADMISSIONS_COND_54c00db3": [1, 0, 2],
        "ADMISSIONS_STATUS_16ca93b9": ["inactive", "inactive", "active"],
        "ADMISSIONS_TATUS_COND_d52bc57a": [0, 0, 1],
    }

    attr_name = Attribute("name")
    group = InputGroup(
        id_="id_name",
        attribute=attr_name,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME", cleaning_script=CleaningScript("clean"))],
    )
    attr_name.add_input_group(group)

    attr_language = Attribute("language[0].code")
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_1",
            attribute=attr_language,
            columns=[
                SqlColumn(
                    "PUBLIC",
                    "ADMISSIONS",
                    "CODE_1",
                )
            ],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND"), "EQ", "1")],
        )
    )
    attr_language.add_input_group(
        InputGroup(
            id_="id_language_2",
            attribute=attr_language,
            columns=[
                SqlColumn(
                    "PUBLIC",
                    "ADMISSIONS",
                    "CODE_2",
                )
            ],
            conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "COND"), "EQ", "2")],
        )
    )

    attr_language_sys = Attribute("language[0].system")
    group = InputGroup(
        id_="id_language_sys",
        attribute=attr_language_sys,
        columns=[SqlColumn("PUBLIC", "ADMISSIONS", "SYSTEM")],
    )
    attr_language_sys.add_input_group(group)

    attr_status = Attribute("status")
    group = InputGroup(
        id_="id_status",
        attribute=attr_status,
        columns=[SqlColumn("PUBLIC", "ADMISSIONS", "STATUS")],
        conditions=[Condition("INCLUDE", SqlColumn("PUBLIC", "ADMISSIONS", "STATUS_COND"), "EQ", "1")],
    )
    attr_status.add_input_group(group)

    analysis = Analysis()
    analysis.attributes = [attr_name, attr_language, attr_language_sys, attr_status]
    analysis.primary_key_column = SqlColumn("PUBLIC", "PATIENTS", "ID")
    analysis.definition = {"type": "Patient"}
    analysis.logical_reference = "9a07bc7d-1e7b-46ff-afd5-f9356255b2f6"

    primary_key_value = data[analysis.primary_key_column.dataframe_column_name()][0]

    transformer = Transformer()
    transformed = transformer.transform_data(data, analysis, primary_key_value)
    actual = transformer.create_fhir_document(transformed, analysis, primary_key_value)

    assert actual == {
        "id": actual["id"],
        "meta": actual["meta"],
        "name": "alice",
        "status": "active",
        "language": [{"code": "abc", "system": "SYS"}, {"system": "SYS"}, {"code": "fed", "system": "SYS"}],
        "resourceType": "Patient",
    }


@mock.patch("river.transformer.transformer.uuid5", mock_uuid5)
def test_compute_fhir_object_id():
    mapping_id = "b8efd322-3e38-4072-9c68-e62e15d84d13"
    pk_value = 123
    assert compute_fhir_object_id(mapping_id, pk_value) == f"{mapping_id}{pk_value}"


@mock.patch("river.transformer.transformer.uuid5", mock_uuid5)
def test_compute_fhir_object_id_normalized():
    mapping_id = "b8efd322-3e38-4072-9c68-e62e15d84d13"
    pk_value = 123.0
    assert compute_fhir_object_id(mapping_id, pk_value) == f"{mapping_id}123"


@mock.patch("river.transformer.transformer.uuid5", mock_uuid5)
def test_compute_fhir_object_id_decimal():
    mapping_id = "b8efd322-3e38-4072-9c68-e62e15d84d13"
    pk_value = float(123.123)
    with pytest.raises(ValueError, match=f"primary key cannot be a decimal number, got {pk_value}"):
        compute_fhir_object_id(mapping_id, pk_value)
