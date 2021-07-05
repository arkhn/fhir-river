import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_list_scripts(api_client):
    url = reverse("scripts")

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data == [
        {"name": "add_default_timezone", "description": None, "category": "custom"},
        {"name": "clean_address", "description": None, "category": "custom"},
        {
            "name": "clean_codes",
            "description": 'Remove terminology system from code ("HL7:male") to ("male")',
            "category": "custom",
        },
        {"name": "clean_date", "description": None, "category": "custom"},
        {"name": "clean_dateTime", "description": None, "category": "custom"},
        {"name": "clean_instant", "description": None, "category": "custom"},
        {"name": "clean_phone", "description": None, "category": "custom"},
        {
            "name": "clean_quantity",
            "description": (
                "[deprecated: river parses types automatically]\nRemoves input not conform to FHIR quantity type"
            ),
            "category": "custom",
        },
        {"name": "clean_time", "description": None, "category": "custom"},
        {
            "name": "code_to_empty",
            "description": "Return None when entry is some code: -1 or (sans)",
            "category": "custom",
        },
        {"name": "is_empty", "description": "(Logic) is None, NaN, empty or blank str", "category": "custom"},
        {"name": "map_2_true", "description": "Map some code from (2->True) and None otherwise", "category": "custom"},
        {"name": "map_deceased", "description": "Map (O,N) to (True, False)", "category": "custom"},
        {"name": "map_family_situation", "description": "Maps French family situation", "category": "custom"},
        {
            "name": "map_gender",
            "description": "Map gender from (M,F) or (HL7:M, HL7:F) to (male,female)",
            "category": "custom",
        },
        {"name": "map_gender_numeric", "description": "Map gender from (1,2) to (male, female)", "category": "custom"},
        {"name": "map_intent", "description": "Map (0,1,NULL) to (plan, order, proposal)", "category": "custom"},
        {"name": "map_marital_status", "description": "Map MIMIC marital status", "category": "custom"},
        {"name": "map_permission", "description": "Map UMLS codes (Yes, No) to (permit, deny)", "category": "custom"},
        {"name": "map_status", "description": "Map code (0,1) to (active,inactive)", "category": "custom"},
        {"name": "merge_insee", "description": None, "category": "custom"},
        {"name": "value", "description": "Return None when entry is 0", "category": "custom"},
        {"name": "zero_to_empty", "description": "Return None when entry is 0", "category": "custom"},
        {"name": "binary_to_bool_1", "description": "Map (0,1) to (False, True)", "category": "logic"},
        {"name": "binary_to_bool_2", "description": "Map (0,1) to (True, False)", "category": "logic"},
        {"name": "if_valid", "description": None, "category": "logic"},
        {"name": "is_empty", "description": "(Logic) is None, NaN, empty or blank str", "category": "logic"},
        {
            "name": "merge_status",
            "description": "Merge two binary entries and return a FHIR CarePlan.status",
            "category": "logic",
        },
        {"name": "string_to_bool", "description": 'Convert ("True","true","TRUE") to (True)..', "category": "logic"},
        {"name": "value", "description": 'Convert ("True","true","TRUE") to (True)..', "category": "logic"},
        {
            "name": "concat_without_separator",
            "description": "Merging script with a simple concatenation, no separator",
            "category": "utils",
        },
        {"name": "is_empty", "description": "(Logic) is None, NaN, empty or blank str", "category": "utils"},
        {"name": "make_title", "description": "Capitalize and strip", "category": "utils"},
        {
            "name": "merge_concat",
            "description": 'Merging script with a simple concatenation and a " " separator',
            "category": "utils",
        },
        {"name": "merge_datetime", "description": "Merging script with a datetime concatenation", "category": "utils"},
        {
            "name": "select_first_not_empty",
            "description": "Merging script which select the first input not empty",
            "category": "utils",
        },
        {"name": "select_max", "description": "Merging script which selects the maximal element", "category": "utils"},
        {"name": "select_min", "description": "Merging script which selects the minimal element", "category": "utils"},
        {"name": "strip", "description": "Strip strings, convert NaN and None to empty string", "category": "utils"},
    ]
