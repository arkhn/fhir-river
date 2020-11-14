#!/usr/bin/env python

import json
import datetime
from confluent_kafka import Producer, KafkaError, KafkaException

from logger import format_traceback
from transformer.src.config.service_logger import logger


class TransformerProducer:
    def __init__(self, broker=None, callback_function=None):
        """
        Instantiate the class and create the consumer object
        :param broker: host[:port]’ string (or list of ‘host[:port]’ strings)
            that the consumer should contact to bootstrap initial cluster metadata
        :param callback_function: fn taking 3 args: err, msg, obj, that is called
            after the event is produced
        and an error increment (int). Default logs the error or success
        """
        self.broker = broker
        self.callback_function = callback_function if callback_function else self.callback_fn

        # Create consumer
        self.producer = Producer(self._generate_config())

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        """
        config = {
            "bootstrap.servers": self.broker,
            "session.timeout.ms": 6000,
            "max.block.ms": 15000,
        }
        return config

    def produce_event(self, topic, record):
        """
        Produce event in the specified topic
        :param topic: str
        :param record: dict
        :return:
        """
        try:
            self.producer.produce(
                topic=topic,
                value=json.dumps(record, default=self.default_json_encoder),
                callback=lambda err, msg, obj=record: self.callback_function(err, msg, obj),
            )
            self.producer.poll(1)  # Callback function
        except ValueError:
            logger.error(format_traceback())
        except KafkaException as e:
            if e == KafkaError.UNKNOWN_TOPIC_OR_PART:
                pass
            else:
                logger.error(format_traceback())

    @staticmethod
    def default_json_encoder(o):
        """
        Json Encoder for datetime
        """
        if isinstance(o, (datetime.date, datetime.datetime)):
            return o.isoformat()

    @staticmethod
    def callback_fn(err, msg, obj):
        """
        Handle delivery reports served from producer.poll.
        This callback takes an extra argument, obj.
        This allows the original contents to be included for debugging purposes.
        """
        if err is not None:
            logger.debug(
                "Message {} delivery failed with error {} for topic {}".format(
                    obj, err, msg.topic()
                )
            )
        else:
            logger.debug("Event Successfully created")
