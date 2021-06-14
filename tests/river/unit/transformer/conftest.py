import pytest


@pytest.fixture
def identifier():
    return {
        "system": "http://terminology.arkhn.org/mimic_id/3fd9abb2-c4dc-4dc7-a2f8-888d5714aac4",
        "value": "123",
    }


@pytest.fixture
def patient():
    return {
        "id": "pat1",
        "resourceType": "Patient",
        "identifier": [
            {
                "value": "111",
                "system": "http://terminology.arkhn.org/mimic_id/8758b68b-8743-4cad-97c3-a1182e0085bb",
                "assigner": {
                    "type": "Organization",
                    "identifier": {
                        "system": "http://terminology.arkhn.org/mimic_id/14d524bd-42c9-4457-a66b-3d439a90d5d4",
                        "value": "456",
                    },
                },
            }
        ],
        "generalPractitioner": [
            {
                "type": "Practitioner",
                "identifier": {
                    "system": "http://terminology.arkhn.org/mimic_id/3fd9abb2-c4dc-4dc7-a2f8-888d5714aac4",
                    "value": "123",
                },
            },
            {
                "type": "Practitioner",
                "identifier": {
                    "system": "http://terminology.arkhn.org/mimic_id/3fd9abb2-c4dc-4dc7-a2f8-888d5714aac4",
                    "value": "321",
                },
            },
        ],
        "managingOrganization": {
            "type": "Organization",
            "identifier": {
                "system": "http://terminology.arkhn.org/mimic_id/14d524bd-42c9-4457-a66b-3d439a90d5d4",
                "value": "789",
            },
        },
    }


@pytest.fixture(scope="session")
def dict_map_code():
    return {
        "ABC": "abc",
        "DEF": "def",
        "GHI": "ghi",
    }


@pytest.fixture(scope="session")
def dict_map_gender():
    return {
        "M": "male",
        "F": "female",
    }


@pytest.fixture(scope="session")
def dict_map_identifier():
    return {
        "1": "A",
        "2": "B",
        "3": "C",
    }
