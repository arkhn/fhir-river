import unittest
from unittest import mock

from common.service.errors import BatchCancelled
from extractor.service import broadcast_events


class BroadCastEventsTestCase(unittest.TestCase):
    @mock.patch("extractor.extract.extractor.Extractor.split_dataframe", return_value=[1, 2, 3])
    def test_skipping_redis_call_when_batch_cancelled(self, _):
        producer = mock.MagicMock()
        producer.produce_event.side_effect = [None, BatchCancelled]
        analysis = mock.Mock(definition_id="definition_id", resource_id="resource_id")
        redis = mock.MagicMock()

        broadcast_events(None, analysis, producer, redis)

        assert producer.produce_event.call_count == 2
        redis.hset.assert_not_called()

    @mock.patch("extractor.extract.extractor.Extractor.split_dataframe", return_value=[])
    def test_redis_counter_when_batch_empty(self, _):
        producer = mock.MagicMock()
        analysis = mock.Mock(definition_id="definition_id", resource_id="resource_id")
        redis = mock.MagicMock()

        broadcast_events(None, analysis, producer, redis, "batch_id")

        producer.produce_event.assert_not_called()
        redis.hset.assert_called_once_with("batch:batch_id:counter", "resource:resource_id:extracted", 0)

    @mock.patch("extractor.extract.extractor.Extractor.split_dataframe", return_value=[1, 2, 3])
    def test_redis_counter_when_no_exception_occurs(self, _):
        producer = mock.MagicMock()
        last_event = {
            "batch_id": "batch_id",
            "resource_type": "definition_id",
            "resource_id": "resource_id",
            "record": 3,
        }
        analysis = mock.Mock(definition_id="definition_id", resource_id="resource_id")
        redis = mock.MagicMock()

        broadcast_events(None, analysis, producer, redis, "batch_id")

        assert producer.produce_event.call_count == 3
        producer.produce_event.assert_called_with(topic=mock.ANY, event=last_event)
        redis.hset.assert_called_once_with("batch:batch_id:counter", "resource:resource_id:extracted", 3)


if __name__ == "__main__":
    unittest.main()
