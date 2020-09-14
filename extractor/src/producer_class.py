#!/usr/bin/env python

from confluent_kafka import Producer
import datetime
import json

from logging.logger import get_logger

logger = get_logger(["resource_id"])


class ExtractorProducer:
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
        self.partition = 0
        self.callback_function = callback_function if callback_function else self.callback_fn

        # Create producer
        self.producer = Producer(self._generate_config())

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        :return:
        """
        config = {"bootstrap.servers": self.broker, "session.timeout.ms": 6000}
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
                value=json.dumps(event, default=self.default_json_encoder),
                callback=lambda err, msg, obj=event: self.callback_function(err, msg, obj),
            )
            self.producer.poll(1)  # Callback function
        except ValueError as error:
            logger.error(error)

    @staticmethod
    def default_json_encoder(o):
        """
        Json Encoder for datetime
        :return:
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
            logger.debug(f"Message {obj} delivery failed with error {err} for topic {msg.topic()}")
        else:
            logger.debug("Event Successfully created")
