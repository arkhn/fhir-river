import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_list_scripts(api_client):
    url = reverse("scripts")

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data == [
        {"name": "binary_to_bool_1", "description": "Map (0,1) to (False, True)"},
        {"name": "binary_to_bool_2", "description": "Map (0,1) to (True, False)"},
        {"name": "clean_address", "description": None},
        {"name": "clean_codes", "description": 'Remove terminology system from code ("HL7:male") to ("male")'},
        {"name": "clean_date", "description": None},
        {"name": "clean_dateTime", "description": None},
        {"name": "clean_instant", "description": None},
        {"name": "clean_phone", "description": None},
        {
            "name": "clean_quantity",
            "description": "[deprecated: river parses types automatically]\n"
            "Removes input not conform to FHIR quantity type",
        },
        {"name": "clean_time", "description": None},
        {"name": "code_to_empty", "description": "Return None when entry is some code: -1 or (sans)"},
        {
            "name": "concat_without_separator",
            "description": "Merging script with a simple concatenation, no separator",
        },
        {"name": "if_valid", "description": None},
        {"name": "is_empty", "description": "(Logic) is None, NaN, empty or blank str"},
        {"name": "make_title", "description": "Capitalize and strip"},
        {"name": "map_2_true", "description": "Map some code from (2->True) and None otherwise"},
        {"name": "map_deceased", "description": "Map (O,N) to (True, False)"},
        {"name": "map_family_situation", "description": "Maps French family situation"},
        {"name": "map_gender", "description": "Map gender from (M,F) or (HL7:M, HL7:F) to (male,female)"},
        {"name": "map_gender_numeric", "description": "Map gender from (1,2) to (male, female)"},
        {"name": "map_intent", "description": "Map (0,1,NULL) to (plan, order, proposal)"},
        {"name": "map_marital_status", "description": "Map MIMIC marital status"},
        {"name": "map_permission", "description": "Map UMLS codes (Yes, No) to (permit, deny)"},
        {
            "name": "map_priority",
            "description": "Map int to ServiceRequest.priority (0: stat, 1: asap, 2: urgent, 3+ routine)",
        },
        {"name": "map_status", "description": "Map code (0,1) to (active,inactive)"},
        {"name": "merge_concat", "description": 'Merging script with a simple concatenation and a " " separator'},
        {"name": "merge_datetime", "description": "Merging script with a datetime concatenation"},
        {"name": "merge_insee", "description": None},
        {"name": "merge_status", "description": "Merge two binary entries and return a FHIR CarePlan.status"},
        {"name": "select_first_not_empty", "description": "Merging script which select the first input not empty"},
        {"name": "select_max", "description": "Merging script which selects the maximal element"},
        {"name": "select_min", "description": "Merging script which selects the minimal element"},
        {"name": "string_to_bool", "description": 'Convert ("True","true","TRUE") to (True)..'},
        {"name": "strip", "description": "Strip strings, convert NaN and None to empty string"},
        {"name": "zero_to_empty", "description": "Return None when entry is 0"},
    ]
