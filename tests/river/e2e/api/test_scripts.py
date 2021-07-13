import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_list_scripts(api_client):
    url = reverse("scripts")

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data == [
        {"category": "cleaning", "description": "Map (0,1) to (False, True)", "name": "binary_to_bool_1"},
        {"category": "cleaning", "description": "Map (0,1) to (True, False)", "name": "binary_to_bool_2"},
        {"category": "cleaning", "description": None, "name": "clean_address"},
        {
            "category": "cleaning",
            "description": 'Remove terminology system from code ("HL7:male") to ("male")',
            "name": "clean_codes",
        },
        {"category": "cleaning", "description": None, "name": "clean_date"},
        {"category": "cleaning", "description": None, "name": "clean_dateTime"},
        {"category": "cleaning", "description": None, "name": "clean_instant"},
        {"category": "cleaning", "description": None, "name": "clean_phone"},
        {
            "category": "cleaning",
            "description": "[deprecated: river parses types automatically]\n"
            "Removes input not conform to FHIR quantity type",
            "name": "clean_quantity",
        },
        {"category": "cleaning", "description": None, "name": "clean_time"},
        {
            "category": "cleaning",
            "description": "Return None when entry is some code: -1 or (sans)",
            "name": "code_to_empty",
        },
        {"category": "cleaning", "description": None, "name": "if_valid"},
        {"category": "cleaning", "description": "Capitalize and strip", "name": "make_title"},
        {
            "category": "cleaning",
            "description": "Map some code from (2->True) and None otherwise",
            "name": "map_2_true",
        },
        {"category": "cleaning", "description": "Map (O,N) to (True, False)", "name": "map_deceased"},
        {"category": "cleaning", "description": "Maps French family situation", "name": "map_family_situation"},
        {
            "category": "cleaning",
            "description": "Map gender from (M,F) or (HL7:M, HL7:F) to (male,female)",
            "name": "map_gender",
        },
        {
            "category": "cleaning",
            "description": "Map gender from (1,2) to (male, female)",
            "name": "map_gender_numeric",
        },
        {"category": "cleaning", "description": "Map (0,1,NULL) to (plan, order, proposal)", "name": "map_intent"},
        {"category": "cleaning", "description": "Map MIMIC marital status", "name": "map_marital_status"},
        {
            "category": "cleaning",
            "description": "Map UMLS codes (Yes, No) to (permit, deny)",
            "name": "map_permission",
        },
        {
            "category": "cleaning",
            "description": "Map int to ServiceRequest.priority (0: stat, 1: asap, 2: " "urgent, 3+ routine)",
            "name": "map_priority",
        },
        {"category": "cleaning", "description": "Map code (0,1) to (active,inactive)", "name": "map_status"},
        {
            "category": "cleaning",
            "description": 'Convert ("True","true","TRUE") to (True)..',
            "name": "string_to_bool",
        },
        {
            "category": "cleaning",
            "description": "Strip strings, convert NaN and None to empty string",
            "name": "strip",
        },
        {"category": "cleaning", "description": "Return None when entry is 0", "name": "zero_to_empty"},
        {
            "category": "merging",
            "description": 'Merging script with a simple concatenation and a " " ' "separator",
            "name": "merge_concat",
        },
        {
            "category": "merging",
            "description": "Merging script with a datetime concatenation",
            "name": "merge_datetime",
        },
        {"category": "merging", "description": None, "name": "merge_insee"},
        {
            "category": "merging",
            "description": "Merge two binary entries and return a FHIR CarePlan.status",
            "name": "merge_status",
        },
        {
            "category": "merging",
            "description": "Merging script which select the first input not empty",
            "name": "select_first_not_empty",
        },
    ]
