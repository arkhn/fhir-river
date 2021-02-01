import unittest
from unittest import mock

from common.service.errors import BatchCancelled
from extractor.errors import EmptyResult
from extractor.service import broadcast_events


class BroadCastEventsTestCase(unittest.TestCase):
    @mock.patch("common.kafka.producer.Producer", return_value=mock.MagicMock())
    @mock.patch("extractor.extract.extractor.Extractor", return_value=mock.MagicMock())
    def test_skipping_redis_call_when_batch_cancelled(self, mock_extractor, mock_producer):
        extractor = mock_extractor()
        extractor.split_dataframe.return_value = [1, 2, 3]
        producer = mock_producer()
        producer.produce_event.side_effect = BatchCancelled
        analysis = mock.Mock(definition_id='definition_id', resource_id='resource_id')
        redis = mock.MagicMock()

        broadcast_events(None, analysis, producer, extractor, redis)

        redis.hset.assert_not_called()

    @mock.patch("common.kafka.producer.Producer", return_value=mock.MagicMock())
    @mock.patch("extractor.extract.extractor.Extractor", return_value=mock.MagicMock())
    def test_redis_counter_when_batch_empty(self, mock_extractor, mock_producer):
        extractor = mock_extractor()
        extractor.split_dataframe.side_effect = EmptyResult
        producer = mock_producer()
        analysis = mock.Mock(definition_id='definition_id', resource_id='resource_id')
        redis = mock.MagicMock()

        broadcast_events(None, analysis, producer, extractor, redis, "batch_id")

        redis.hset.assert_called_once()
        redis.hset.assert_called_with("batch:batch_id:counter", "resource:resource_id:extracted", 0)

    @mock.patch("common.kafka.producer.Producer", return_value=mock.MagicMock())
    @mock.patch("extractor.extract.extractor.Extractor", return_value=mock.MagicMock())
    def test_redis_counter_when_no_exception_occurs(self, mock_extractor, mock_producer):
        extractor = mock_extractor()
        extractor.split_dataframe.return_value = [1, 2, 3]
        producer = mock_producer()
        analysis = mock.Mock(definition_id='definition_id', resource_id='resource_id')
        redis = mock.MagicMock()

        broadcast_events(None, analysis, producer, extractor, redis, "batch_id")

        redis.hset.assert_called_once()
        redis.hset.assert_called_with("batch:batch_id:counter", "resource:resource_id:extracted", 3)


if __name__ == '__main__':
    unittest.main()
