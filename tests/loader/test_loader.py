from unittest import mock

from fhir.resources.operationoutcome import OperationOutcome

from loader.load.loader import Loader


def test_load():
    store = mock.Mock()
    fhir_loader = Loader(store)

    fhir_loader.load({"name": "instance1", "value": 1}, resource_type="Patient")
    fhir_loader.load({"name": "instance2", "value": 2}, resource_type="Patient")
    fhir_loader.load({"name": "instance3", "value": 3}, resource_type="Patient")

    assert store.create.call_count == 3
    store.create.assert_has_calls(
        [
            mock.call({"name": "instance1", "value": 1}),
            mock.call({"name": "instance2", "value": 2}),
            mock.call({"name": "instance3", "value": 3}),
        ]
    )


@mock.patch("loader.load.loader.counter_failed_validations")
def test_load_duplicate_key_error(mock_counter_failed_validations, caplog):
    store = mock.Mock()
    store.create.return_value = OperationOutcome(
        issue=[{"severity": "error", "code": "duplicate", "diagnostics": "dup key err"}]
    )
    fhir_loader = Loader(store)

    doc = {"key": "val", "meta": {"tag": [{"code": "source_id"}, {"code": "resource_id"}]}}
    fhir_loader.load(doc, resource_type="Patient")

    assert (
        str(
            {
                "message": "Document already present",
                "diagnostics": "dup key err",
                "document": doc,
                "resource_id": "resource_id",
            }
        )
        in caplog.text
    )
    mock_counter_failed_validations.labels.assert_not_called()


@mock.patch("loader.load.loader.counter_failed_validations")
def test_load_validation_error(mock_counter_failed_validations, caplog):
    store = mock.Mock()
    store.create.return_value = OperationOutcome(
        issue=[{"severity": "error", "code": "invalid", "diagnostics": "invalid"}]
    )
    fhir_loader = Loader(store)

    doc = {"key": "val", "meta": {"tag": [{"code": "source_id"}, {"code": "resource_id"}]}}
    fhir_loader.load(doc, resource_type="Patient")

    assert (
        str({"message": "Validation failed", "diagnostics": "invalid", "document": doc, "resource_id": "resource_id"})
        in caplog.text
    )
    mock_counter_failed_validations.labels.assert_called_with(resource_id="resource_id", resource_type="Patient")
