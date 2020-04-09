import json

from fhir_transformer.src.config.logger import create_logger
from fhir_transformer.src.transform.fhir import create_fhir_document
from fhir_transformer.src.helper import get_topic_name

logger = create_logger("transformer")


class Transformer:
    def __init__(self, producer):
        self.producer = producer

    def transform(self, row, analysis):
        return create_fhir_document(row, analysis)

    def process_event(self, msg):
        """
        Process the event
        :param msg:
        :return:
        """
        # Do stuff
        msg_value = json.loads(msg.value())
        msg_topic = msg.topic()
        logger.info("Transformer")
        logger.info(msg_topic)
        logger.info(msg_value)

        try:
            logger.info(msg_value["analysis"])
            fhir_instance = self.transform(msg_value["record"], msg_value["analysis"])
            topic = get_topic_name(
                source="mimic", resource=msg_value["resource_type"], task_type="transform"
            )
            self.producer.produce_event(topic=topic, record=fhir_instance)
        except KeyError as err:
            logger.error(err)

    def manage_kafka_error(self, msg):
        """
        Deal with the error if nany
        :param msg:
        :return:
        """
        logger.error(msg.error())
        pass
