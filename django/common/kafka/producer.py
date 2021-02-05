import datetime
import decimal
import json
import logging

from common.service.errors import BatchCancelled
from confluent_kafka import KafkaError, KafkaException
from confluent_kafka import Producer as KafkaProducer

logger = logging.getLogger("kafka.producer")


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings without trailing 0
            return float(obj)
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        return super().default(obj)


class Producer:
    def __init__(self, broker=None, callback_function=None):
        """
        Instantiate the class and create the consumer object
        :param broker: host[:port]’ string (or list of ‘host[:port]’ strings) that
            the consumer should contact to bootstrap initial cluster metadata
        :param callback_function: fn taking 3 args: err, msg, obj, that is called
            after the event is produced and an error increment (int).
            Default logs the error or success
        """
        self.broker = broker
        self.callback_function = callback_function if callback_function else self.callback_fn

        self.producer = KafkaProducer(self._generate_config())

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        """
        # confluent-kafka-python v1.5.0 release note:
        # The default producer batch accumulation time, linger.ms, has been changed
        # from 0.5ms to 5ms but we require lower produce latency
        config = {
            "bootstrap.servers": self.broker,
            "linger.ms": 0.5,
            "session.timeout.ms": 6000,
        }
        return config

    def produce_event(self, topic, event):
        """
        Produce event in the specified topic
        :param topic: str
        :param event: dict
        :return:
        """
        try:
            self.producer.produce(
                topic=topic,
                value=CustomJSONEncoder().encode(event),
                callback=lambda err, msg, obj=event: self.callback_function(err, msg, obj),
            )
            self.producer.poll(1)  # Callback function
        except ValueError as err:
            logger.exception(err)
        except KafkaException as err:
            if err.args[0].code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
                raise BatchCancelled("The current batch has been cancelled")
            else:
                logger.exception(err)

    @staticmethod
    def callback_fn(err, msg, obj):
        """
        Handle delivery reports served from producer.poll.
        This callback takes an extra argument, obj.
        This allows the original contents to be included for debugging purposes.
        """
        if err is not None:
            logger.debug(f"Message {obj} delivery failed with error {err} for topic {msg.topic()}")
        else:
            logger.debug("Event Successfully created")
