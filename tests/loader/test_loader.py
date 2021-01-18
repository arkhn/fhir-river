from unittest import mock

from loader.load.loader import Loader


def test_save_one():
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
