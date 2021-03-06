from unittest import mock

from common.analyzer.analysis import Analysis
from common.analyzer.attribute import Attribute
from common.analyzer.cleaning_script import CleaningScript
from common.analyzer.concept_map import ConceptMap
from common.analyzer.input_group import InputGroup
from common.analyzer.merging_script import MergingScript
from common.analyzer.sql_column import SqlColumn
from transformer.transform import Transformer


def mock_get_script(*args):
    if len(args) == 1:
        return args[0].replace("dirty", "")
    elif len(args) == 2:
        return args[0]
    else:
        return args[0] + args[1] + "merge"


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("common.analyzer.cleaning_script.scripts.get_script", return_value=mock_get_script)
def test_transform(_, mock_sha1, dict_map_code):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    data = {
        "PATIENTS_NAME_hash": ["alicedirty", "alicedirty", "alicedirty"],
        "PATIENTS_ID_hash": ["id1", "id1", "id1"],
        "PATIENTS_ID2_hash": ["id21", "id21", "id21"],
        "ADMISSIONS_CODE_hash": ["ABCdirty", "ABCdirty", "DEFdirty"],
    }

    attr_name = Attribute("name")
    group = InputGroup(
        id_="id_name",
        attribute=attr_name,
        columns=[SqlColumn("PUBLIC", "PATIENTS", "NAME", cleaning_script=CleaningScript("clean1"))],
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
                cleaning_script=CleaningScript("clean1"),
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

    transformer = Transformer()
    transformed = transformer.transform_data(data, analysis)
    actual = transformer.create_fhir_document(transformed, analysis)

    assert actual == {
        "id": actual["id"],
        "meta": actual["meta"],
        "name": "alice",
        "language": [{"code": "abc"}, {"code": "abc"}, {"code": "def"}],
        "static": "static",
        "static_list": ["static_list"],
        "resourceType": "Patient",
    }
