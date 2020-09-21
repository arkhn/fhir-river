from unittest import mock
from pytest import raises
import json
from loader.src.reference_binder import ReferenceBinder
import fakeredis


def test_extract_key_tuple():
    identifier1 = {
        "value": "v",
        "system": "s",
    }
    assert ReferenceBinder.extract_key_tuple(identifier1) == ("v", "s", None, None)

    identifier2 = {"type": {"coding": [{"code": "c", "system": "s"}]}}
    assert ReferenceBinder.extract_key_tuple(identifier2) == (None, None, "c", "s")

    with raises(
        Exception,
            match="(identifier.value and identifier.system) or (identifier.type.coding.code and "
                  "identifier.type.coding.system) are required and mutually exclusive"
    ):
        identifier3 = {
            "value": "v",
            "system": "s",
            "type": {"coding": [{"code": "c", "system": "s"}]},
        }
        ReferenceBinder.extract_key_tuple(identifier3)

    with raises(
        Exception,
        match="(identifier.value and identifier.system) or (identifier.type.coding.code and "
              "identifier.type.coding.system) are required and mutually exclusive"
    ):
        identifier3 = {
            "value": "v",
        }
        ReferenceBinder.extract_key_tuple(identifier3)


@mock.patch("loader.src.cache.redis.conn", return_value=mock.MagicMock())
@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_existing_reference(mock_fhirstore, mock_redis, patient):
    store = mock_fhirstore()
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
                    "identifier.value": "123",
                    "identifier.system": "http://terminology.arkhn.org/mimic_id/practitioner_id",
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier.value": "789",
                    "identifier.system": "http://terminology.arkhn.org/mimic_id/organization_id",
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier.value": "456",
                    "identifier.system": "http://terminology.arkhn.org/mimic_id/organization_id",
                },
                ["id"],
            ),
        ]
    )

    # literal references must have been resolved
    assert res["generalPractitioner"][0]["reference"] == "Practitioner/practitioner1"
    assert res["managingOrganization"]["reference"] == "Organization/organization1"
    assert res["identifier"][0]["assigner"]["reference"] == "Organization/organization2"


@mock.patch("loader.src.cache.redis.conn", return_value=mock.MagicMock())
@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_existing_reference_not_found(mock_fhirstore, mock_redis, patient):
    store = mock_fhirstore()
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
    calls = [
        mock.call(
            json.dumps(
                (
                    "Practitioner",
                    ("123", "http://terminology.arkhn.org/mimic_id/practitioner_id", None, None,),
                )
            ),
            json.dumps(
                (("Patient", "generalPractitioner", True), patient["id"])
            )
        ),
        mock.call(
            json.dumps(
                (
                    "Organization",
                    ("789", "http://terminology.arkhn.org/mimic_id/organization_id", None, None,),
                )
            ),
            json.dumps(
                (("Patient", "managingOrganization", False), patient["id"])
            )
        ),
        mock.call(
            json.dumps(
                (
                    "Organization",
                    ("456", "http://terminology.arkhn.org/mimic_id/organization_id", None, None,),
                )
            ),
            json.dumps(
                (("Patient", "identifier.0.assigner", False), patient["id"])
            )
        )
    ]
    ref_binder.cache.sadd.assert_has_calls(calls, any_order=True)
    assert ref_binder.cache.sadd.call_count == 3


@mock.patch("loader.src.cache.redis.conn", return_value=mock.MagicMock())
@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_pending_references(
        mock_fhirstore,
        mock_redis,
        patient,
        test_organization,
        test_practitioner
):
    store = mock_fhirstore()
    ref_binder = ReferenceBinder(store)
    r = fakeredis.FakeStrictRedis()
    ref_binder.cache.sadd.side_effect = r.sadd
    ref_binder.cache.smembers.side_effect = r.smembers
    ref_binder.cache.delete.side_effect = r.delete

    store.db["any"].find_one.side_effect = [None, None, None]

    res = ref_binder.resolve_references(
        patient, ["generalPractitioner", "managingOrganization", "identifier[0].assigner"],
    )

    store.db["any"].find_one.assert_has_calls(
        [
            mock.call(
                {
                    "identifier.value": "123",
                    "identifier.system": "http://terminology.arkhn.org/mimic_id/practitioner_id",
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier.value": "789",
                    "identifier.system": "http://terminology.arkhn.org/mimic_id/organization_id",
                },
                ["id"],
            ),
            mock.call(
                {
                    "identifier.value": "456",
                    "identifier.system": "http://terminology.arkhn.org/mimic_id/organization_id",
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
    assert ref_binder.cache.sadd.call_count == 3

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
                            "identifier.value": "123",
                            "identifier.system": "http://terminology.arkhn.org/mimic_id/practitioner_id",  # noqa
                        }
                    },
                },
                # generalPractitioner is an array, therefore we use .$. to update the right item
                {"$set": {"generalPractitioner.$.reference": "Practitioner/practitioner1"}},
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
                    "identifier.0.assigner.identifier.value": "456",
                    "identifier.0.assigner.identifier.system": "http://terminology.arkhn.org/mimic_id/organization_id",  # noqa
                },
                {"$set": {"identifier.0.assigner.reference": "Organization/organization1"}},
            ),
            # the Patient.managingOrganization must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "managingOrganization.identifier.value": "789",
                    "managingOrganization.identifier.system": "http://terminology.arkhn.org/mimic_id/organization_id",  # noqa
                },
                {"$set": {"managingOrganization.reference": "Organization/organization1"}},
            ),
        ]
    )

    # cache must have been emptied
    assert ref_binder.cache.delete.called
    assert r.dbsize() == 0


@mock.patch("loader.src.cache.redis.conn", return_value=mock.MagicMock())
@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_pending_references_code_identifier(
    mock_fhirstore, mock_redis, patient_code_identifier, test_organization, test_practitioner
):
    store = mock_fhirstore()
    ref_binder = ReferenceBinder(store)
    r = fakeredis.FakeStrictRedis()
    ref_binder.cache.sadd.side_effect = r.sadd
    ref_binder.cache.smembers.side_effect = r.smembers
    ref_binder.cache.delete.side_effect = r.delete

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
    assert ref_binder.cache.sadd.call_count == 3
    ref_binder.cache.sadd.assert_any_call(
        json.dumps(
            (
                "Practitioner",
                (None, None, "code_123", "fhir_code_system_practitioner")
            )
        ),
        json.dumps(
            (("Patient", "generalPractitioner", True), patient_code_identifier["id"])
        )
    )

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
                            "identifier.type.coding.0.code": "code_123",
                            "identifier.type.coding.0.system": "fhir_code_system_practitioner",
                        }
                    },
                },
                # generalPractitioner is an array, therefore we use .$. to update the right item
                {"$set": {"generalPractitioner.$.reference": "Practitioner/practitioner1"}},
            )
        ]
    )

    ref_binder.resolve_references(test_organization, [])
    assert store.db["Patient"].update_many.call_count == 3
    store.db["Patient"].update_many.assert_has_calls(
        [
            # the Patient.identifier[0].assigner.reference must have been updated
            # the Patient.identifier[0].assigner.reference must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "identifier.0.assigner.identifier.type.coding.0.code": "code_456",
                    "identifier.0.assigner.identifier.type.coding.0.system": "fhir_code_system_organization",  # noqa
                },
                {"$set": {"identifier.0.assigner.reference": "Organization/organization1"}},
            ),
            # the Patient.managingOrganization must have been updated
            mock.call(
                {
                    "id": {"$in": ["pat1"]},
                    "managingOrganization.identifier.type.coding.0.code": "code_789",
                    "managingOrganization.identifier.type.coding.0.system": "fhir_code_system_organization",  # noqa
                },
                {"$set": {"managingOrganization.reference": "Organization/organization1"}},
            ),
        ]
    )

    # cache must have been emptied
    assert ref_binder.cache.delete.called
    assert r.dbsize() == 0


@mock.patch("loader.src.cache.redis.conn", return_value=mock.MagicMock())
@mock.patch("loader.src.load.fhirstore.get_fhirstore", return_value=mock.MagicMock())
def test_resolve_batch_references(
        mock_fhirstore,
        mock_redis,
        patient,
        test_organization,
        test_practitioner
):
    store = mock_fhirstore()
    ref_binder = ReferenceBinder(store)
    r = fakeredis.FakeStrictRedis()
    ref_binder.cache.sadd.side_effect = r.sadd
    ref_binder.cache.smembers.side_effect = r.smembers
    ref_binder.cache.delete.side_effect = r.delete

    patient_2 = {
        "id": "pat2",
        "resourceType": "Patient",
        "generalPractitioner": patient["generalPractitioner"],
        "link": patient["generalPractitioner"],
    }
    store.db["any"].find_one.side_effect = [None, None, None]

    res = ref_binder.resolve_references(patient, ["generalPractitioner", "link"])
    assert res["generalPractitioner"][0].get("reference") is None
    res = ref_binder.resolve_references(patient_2, ["generalPractitioner", "link"])
    assert res["generalPractitioner"][0].get("reference") is None

    target_ref = (
        "Practitioner",
        ("123", "http://terminology.arkhn.org/mimic_id/practitioner_id", None, None,),
    )
    source_ref = ("Patient", "generalPractitioner", True)
    calls = [
        mock.call(
            json.dumps(target_ref),
            json.dumps(
                (source_ref, patient["id"])
            )
        ),
        mock.call(
            json.dumps(target_ref),
            json.dumps(
                (source_ref,  patient_2["id"])
            )
        )
    ]
    ref_binder.cache.sadd.assert_has_calls(calls, any_order=True)
    # both references must have been cached using the same key.
    # Accordingly, in Redis, there is only one set.
    assert r.dbsize() == 1
    # In the set, we have three items (2 related to pat_2 and 1 related to pat_1)
    assert len(r.smembers(json.dumps(target_ref))) == 3

    ref_binder.resolve_references(test_practitioner, [])
    # the Patient.generalPractitioner.reference must have been updated
    assert store.db["Patient"].update_many.call_count == 2
    calls = [
        (
            {
                "id": {"$in": ["pat2"]},
                "link": {
                    "$elemMatch": {
                        "identifier.value": "123",
                        "identifier.system": "http://terminology.arkhn.org/mimic_id/practitioner_id",  # noqa
                    }
                },
            },
            {"$set": {"link.$.reference": "Practitioner/practitioner1"}}
        ),
        # Any of the two following calls
        (
            {
                "id": {"$in": ["pat1", "pat2"]},
                "generalPractitioner": {
                    "$elemMatch": {
                        "identifier.value": "123",
                        "identifier.system": "http://terminology.arkhn.org/mimic_id/practitioner_id",  # noqa
                    }
                },
            },
            # generalPractitioner is an array, therefore we use .$. to update the right item
            {"$set": {"generalPractitioner.$.reference": "Practitioner/practitioner1"}}
        ),
        (
            {
                "id": {"$in": ["pat2", "pat1"]},
                "generalPractitioner": {
                    "$elemMatch": {
                        "identifier.value": "123",
                        "identifier.system": "http://terminology.arkhn.org/mimic_id/practitioner_id",  # noqa
                    }
                },
            },
            {"$set": {"generalPractitioner.$.reference": "Practitioner/practitioner1"}}
        )
    ]
    store.db["Patient"].update_many.assert_any_call(*calls[0])
    try:
        store.db["Patient"].update_many.assert_any_call(*calls[1])
    except AssertionError:
        store.db["Patient"].update_many.assert_any_call(*calls[2])
    assert store.db["Patient"].update_many.call_count == 2

    # cache must have been emptied
    ref_binder.cache.delete.assert_called_once()
    assert r.dbsize() == 0
