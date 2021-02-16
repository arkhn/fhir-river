from unittest import mock

from fhir.resources.operationoutcome import OperationOutcome

from common.service.errors import BatchCancelled
from loader import service
from loader.conf import conf


def test_load():
    mock_counter_redis = mock.Mock()
    mock_producer = mock.Mock()
    mock_binder = mock.Mock()
    mock_binder.resolve_references.return_value = {"resourceType": "Patient"}

    service.load(
        fhir_object=mock.Mock(),
        batch_id="batch_id",
        resource_id="resource_id",
        loader=mock.Mock(),
        producer=mock_producer,
        binder=mock_binder,
        counter_redis=mock_counter_redis,
        analyzer=mock.Mock(),
    )

    mock_counter_redis.hincrby.assert_called_with("batch:batch_id:counter", "resource:resource_id:loaded", 1)
    mock_producer.produce_event.assert_called_with(
        topic=f"{conf.PRODUCED_TOPIC_PREFIX}batch_id",
        event={"batch_id": "batch_id"},
    )


def test_load_dup_key_error():
    mock_loader = mock.Mock()
    mock_loader.load.return_value = OperationOutcome(
        issue=[{"severity": "error", "code": "duplicate", "diagnostics": "dup key err"}]
    )
    mock_counter_redis = mock.Mock()
    mock_producer = mock.Mock()
    mock_binder = mock.Mock()
    mock_binder.resolve_references.return_value = {"resourceType": "Patient"}

    service.load(
        fhir_object=mock.Mock(),
        batch_id="batch_id",
        resource_id="resource_id",
        loader=mock_loader,
        producer=mock_producer,
        binder=mock_binder,
        counter_redis=mock_counter_redis,
        analyzer=mock.Mock(),
    )

    mock_counter_redis.hincrby.assert_not_called()
    mock_producer.produce_event.assert_not_called()


def test_load_batch_cancelled(caplog):
    mock_counter_redis = mock.Mock()
    mock_producer = mock.Mock()
    mock_producer.produce_event.side_effect = BatchCancelled("batch cancelled")
    mock_binder = mock.Mock()
    mock_binder.resolve_references.return_value = {"resourceType": "Patient"}

    service.load(
        fhir_object=mock.Mock(),
        batch_id="batch_id",
        resource_id="resource_id",
        loader=mock.Mock(),
        producer=mock_producer,
        binder=mock_binder,
        counter_redis=mock_counter_redis,
        analyzer=mock.Mock(),
    )

    mock_counter_redis.hincrby.assert_called_with("batch:batch_id:counter", "resource:resource_id:loaded", 1)
    mock_producer.produce_event.assert_called_with(
        topic=f"{conf.PRODUCED_TOPIC_PREFIX}batch_id",
        event={"batch_id": "batch_id"},
    )
    assert str({"message": "batch cancelled", "resource_id": "resource_id", "batch_id": "batch_id"}) in caplog.text
