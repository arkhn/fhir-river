from pytest import fixture


@fixture
def patient():
    return {
        "id": "pat1",
        "resourceType": "Patient",
        "identifier": [
            {
                "value": "111",
                "system": "http://terminology.arkhn.org/mimic_id/patient_id",
                "assigner": {
                    "type": "Organization",
                    "identifier": {
                        "system": "http://terminology.arkhn.org/mimic_id/organization_id",
                        "value": "456",
                    },
                },
            }
        ],
        "generalPractitioner": [
            {
                "type": "Practitioner",
                "identifier": {
                    "system": "http://terminology.arkhn.org/mimic_id/practitioner_id",
                    "value": "123",
                },
            }
        ],
        "managingOrganization": {
            "type": "Organization",
            "identifier": {
                "system": "http://terminology.arkhn.org/mimic_id/organization_id",
                "value": "789",
            },
        },
    }


@fixture
def patient_code_identifier():
    return {
        "id": "pat1",
        "resourceType": "Patient",
        "identifier": [
            {
                "value": "111",
                "system": "http://terminology.arkhn.org/mimic_id/patient_id",
                "assigner": {
                    "type": "Organization",
                    "identifier": {
                        "type": {
                            "coding": [
                                {"code": "code_456", "system": "fhir_code_system_organization"}
                            ]
                        },
                    },
                },
            }
        ],
        "generalPractitioner": [
            {
                "type": "Practitioner",
                "identifier": {
                    "type": {
                        "coding": [{"code": "code_123", "system": "fhir_code_system_practitioner"}]
                    },
                },
            }
        ],
        "managingOrganization": {
            "type": "Organization",
            "identifier": {
                "type": {
                    "coding": [{"code": "code_789", "system": "fhir_code_system_organization"}]
                },
            },
        },
    }


@fixture
def test_practitioner():
    return {
        "id": "practitioner1",
        "resourceType": "Practitioner",
        "identifier": [
            {"system": "http://terminology.arkhn.org/mimic_id/practitioner_id", "value": "123"},
            {"type": {"coding": [{"code": "code_123", "system": "fhir_code_system_practitioner"}]}},
        ],
    }


@fixture
def test_organization():
    return {
        "id": "organization1",
        "resourceType": "Organization",
        "identifier": [
            {"system": "http://terminology.arkhn.org/mimic_id/organization_id", "value": "456"},
            {"system": "http://terminology.arkhn.org/mimic_id/organization_id", "value": "789"},
            {"type": {"coding": [{"code": "code_456", "system": "fhir_code_system_organization"}]}},
            {"type": {"coding": [{"code": "code_789", "system": "fhir_code_system_organization"}]}},
        ],
    }
