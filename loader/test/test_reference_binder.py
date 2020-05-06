from unittest import mock

import loader.src.load.fhirstore as fhirstore
from loader.src.reference_binder import ReferenceBinder


@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_existing_reference(_, patient):
    store = fhirstore.get_fhirstore()
    ref_binder = ReferenceBinder(store)
    store.db["any"].find_one.side_effect = [
        {"id": "practitioner1"},
        {"id": "organization1"},
        {"id": "organization2"},
    ]

    res = ref_binder.resolve_references(
        patient, ["generalPractitioner", "managingOrganization", "identifier[0].assigner"],
    )

    assert store.db["any"].find_one.call_count == 3
    store.db["any"].find_one.assert_has_calls(
        [
            mock.call(
                {
                    "identifier": {
                        "$elemMatch": {
                            "value": "123",
                            "system": "http://terminology.arkhn.org/mimic_id/practitioner_id",
                        }
                    }
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier": {
                        "$elemMatch": {
                            "value": "789",
                            "system": "http://terminology.arkhn.org/mimic_id/organization_id",
                        }
                    }
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier": {
                        "$elemMatch": {
                            "value": "456",
                            "system": "http://terminology.arkhn.org/mimic_id/organization_id",
                        }
                    }
                },
                ["id"],
            ),
        ]
    )

    # literal references must have been resolved
    assert res["generalPractitioner"][0]["reference"] == "Practitioner/practitioner1"
    assert res["managingOrganization"]["reference"] == "Organization/organization1"
    assert res["identifier"][0]["assigner"]["reference"] == "Organization/organization2"


@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_existing_reference_not_found(_, patient):
    store = fhirstore.get_fhirstore()
    ref_binder = ReferenceBinder(store)
    store.db["any"].find_one.side_effect = [None, None, None]

    res = ref_binder.resolve_references(
        patient, ["generalPractitioner", "managingOrganization", "identifier[0].assigner"],
    )

    # references must not have been resolved
    assert res["generalPractitioner"][0].get("reference") is None
    assert res["managingOrganization"].get("reference") is None
    assert res["identifier"][0]["assigner"].get("reference") is None

    # all references must have been cached
    assert len(ref_binder.cache) == 3
    assert ref_binder.cache[
        (
            "Practitioner",
            ("123", "http://terminology.arkhn.org/mimic_id/practitioner_id", None, None),
        )
    ][("Patient", "generalPractitioner", True)] == [patient["id"]]
    assert ref_binder.cache[
        (
            "Organization",
            ("789", "http://terminology.arkhn.org/mimic_id/organization_id", None, None),
        )
    ][("Patient", "managingOrganization", False)] == [patient["id"]]
    assert ref_binder.cache[
        (
            "Organization",
            ("456", "http://terminology.arkhn.org/mimic_id/organization_id", None, None),
        )
    ][("Patient", "identifier.0.assigner", False)] == [patient["id"]]


@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_pending_references(_, patient, test_organization, test_practitioner):
    store = fhirstore.get_fhirstore()
    ref_binder = ReferenceBinder(store)
    store.db["any"].find_one.side_effect = [None, None, None]

    res = ref_binder.resolve_references(
        patient, ["generalPractitioner", "managingOrganization", "identifier[0].assigner"],
    )

    store.db["any"].find_one.assert_has_calls(
        [
            mock.call(
                {
                    "identifier": {
                        "$elemMatch": {
                            "value": "123",
                            "system": "http://terminology.arkhn.org/mimic_id/practitioner_id",
                        }
                    }
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier": {
                        "$elemMatch": {
                            "value": "789",
                            "system": "http://terminology.arkhn.org/mimic_id/organization_id",
                        }
                    }
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier": {
                        "$elemMatch": {
                            "value": "456",
                            "system": "http://terminology.arkhn.org/mimic_id/organization_id",
                        }
                    }
                },
                ["id"],
            ),
        ]
    )

    # references must not have been resolved
    assert res["generalPractitioner"][0].get("reference") is None
    assert res["managingOrganization"].get("reference") is None
    assert res["identifier"][0]["assigner"].get("reference") is None

    # all references must have been cached
    assert len(ref_binder.cache) == 3

    ref_binder.resolve_references(test_practitioner, [])
    # the Patient.generalPractitioner.reference must have been updated
    assert store.db["Patient"].update_many.call_count == 1
    store.db["Patient"].update_many.assert_has_calls(
        [
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "generalPractitioner": {
                        "$elemMatch": {
                            "identifier": patient["generalPractitioner"][0]["identifier"]
                        }
                    },
                },
                # generalPractitioner is an array, therefore we use .$. to update the right item
                {"$set": {"generalPractitioner.$.reference": "practitioner1"}},
            )
        ]
    )

    ref_binder.resolve_references(test_organization, [])
    assert store.db["Patient"].update_many.call_count == 3
    store.db["Patient"].update_many.assert_has_calls(
        [
            # the Patient.identifier[0].assigner.reference must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "identifier.0.assigner": {
                        "identifier": patient["identifier"][0]["assigner"]["identifier"]
                    },
                },
                {"$set": {"identifier.0.assigner.reference": "organization1"}},
            ),
            # the Patient.managingOrganization must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "managingOrganization": {
                        "identifier": patient["managingOrganization"]["identifier"]
                    },
                },
                {"$set": {"managingOrganization.reference": "organization1"}},
            ),
        ]
    )

    # cache must have been emptied
    assert len(ref_binder.cache) == 0


@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_pending_references_code_identifier(
    _, patient_code_identifier, test_organization, test_practitioner
):
    store = fhirstore.get_fhirstore()
    ref_binder = ReferenceBinder(store)
    store.db["any"].find_one.side_effect = [None, None, None]

    res = ref_binder.resolve_references(
        patient_code_identifier,
        ["generalPractitioner", "managingOrganization", "identifier[0].assigner"],
    )

    # references must not have been resolved
    assert res["generalPractitioner"][0].get("reference") is None
    assert res["managingOrganization"].get("reference") is None
    assert res["identifier"][0]["assigner"].get("reference") is None

    # all references must have been cached
    assert len(ref_binder.cache) == 3
    assert (
        "Practitioner",
        (None, None, "code_123", "fhir_code_system_practitioner"),
    ) in ref_binder.cache

    ref_binder.resolve_references(test_practitioner, [])
    # the Patient.generalPractitioner.reference must have been updated
    assert store.db["Patient"].update_many.call_count == 1
    store.db["Patient"].update_many.assert_has_calls(
        [
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "generalPractitioner": {
                        "$elemMatch": {
                            "identifier": patient_code_identifier["generalPractitioner"][0][
                                "identifier"
                            ]
                        }
                    },
                },
                # generalPractitioner is an array, therefore we use .$. to update the right item
                {"$set": {"generalPractitioner.$.reference": "practitioner1"}},
            )
        ]
    )

    ref_binder.resolve_references(test_organization, [])
    assert store.db["Patient"].update_many.call_count == 3
    store.db["Patient"].update_many.assert_has_calls(
        [
            # the Patient.identifier[0].assigner.reference must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "identifier.0.assigner": {
                        "identifier": patient_code_identifier["identifier"][0]["assigner"][
                            "identifier"
                        ]
                    },
                },
                {"$set": {"identifier.0.assigner.reference": "organization1"}},
            ),
            # the Patient.managingOrganization must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "managingOrganization": {
                        "identifier": patient_code_identifier["managingOrganization"]["identifier"]
                    },
                },
                {"$set": {"managingOrganization.reference": "organization1"}},
            ),
        ]
    )

    # cache must have been emptied
    assert len(ref_binder.cache) == 0


@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_batch_references(_, patient, test_organization, test_practitioner):
    store = fhirstore.get_fhirstore()
    ref_binder = ReferenceBinder(store)
    patient_2 = {
        "id": "pat2",
        "resourceType": "Patient",
        "generalPractitioner": patient["generalPractitioner"],
        "link": patient["generalPractitioner"],
    }
    store.db["any"].find_one.side_effect = [None, None, None]

    res = ref_binder.resolve_references(patient, ["generalPractitioner", "link"],)
    assert res["generalPractitioner"][0].get("reference") is None
    res = ref_binder.resolve_references(patient_2, ["generalPractitioner", "link"],)
    assert res["generalPractitioner"][0].get("reference") is None

    # both references must have been cached using the same key
    assert len(ref_binder.cache) == 1
    assert (
        len(
            ref_binder.cache[
                (
                    "Practitioner",
                    ("123", "http://terminology.arkhn.org/mimic_id/practitioner_id", None, None),
                )
            ]
        )
        == 2
    )

    ref_binder.resolve_references(test_practitioner, [])
    # the Patient.generalPractitioner.reference must have been updated
    assert store.db["Patient"].update_many.call_count == 2
    store.db["Patient"].update_many.assert_has_calls(
        [
            mock.call(
                {
                    "id": {"$in": ["pat1", "pat2"]},
                    "generalPractitioner": {
                        "$elemMatch": {
                            "identifier": patient_2["generalPractitioner"][0]["identifier"]
                        }
                    },
                },
                # generalPractitioner is an array, therefore we use .$. to update the right item
                {"$set": {"generalPractitioner.$.reference": "practitioner1"}},
            ),
            mock.call(
                {
                    "id": {"$in": ["pat2"]},
                    "link": {"$elemMatch": {"identifier": patient_2["link"][0]["identifier"]}},
                },
                {"$set": {"link.$.reference": "practitioner1"}},
            ),
        ]
    )
    # cache must have been emptied
    assert len(ref_binder.cache) == 0
