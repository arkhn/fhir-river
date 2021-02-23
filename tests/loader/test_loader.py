from unittest import mock

import pytest

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


@pytest.mark.parametrize(
    "code,message,diagnostic,should_ind_counter",
    [
        ("invalid", "Validation failed", "invalid", True),
        ("duplicate", "Document already present", "dup key err", False),
        ("other", "Error while loading the fhir document", "other", False),
    ],
)
@mock.patch("loader.load.loader.counter_failed_validations")
def test_load_error(mock_counter_failed_validations, caplog, code, message, diagnostic, should_ind_counter):
    store = mock.Mock()
    store.create.return_value = OperationOutcome(
        issue=[{"severity": "error", "code": code, "diagnostics": diagnostic}]
    )
    fhir_loader = Loader(store)

    doc = {"key": "val", "meta": {"tag": [{"code": "source_id"}, {"code": "resource_id"}]}}
    fhir_loader.load(doc, resource_type="Patient")

    assert (
        str(
            {
                "message": message,
                "diagnostics": diagnostic,
                "document": doc,
                "resource_id": "resource_id",
            }
        )
        in caplog.text
    )
    if should_ind_counter:
        mock_counter_failed_validations.labels.assert_called_with(resource_id="resource_id", resource_type="Patient")
    else:
        mock_counter_failed_validations.labels.assert_not_called()
