#!/usr/bin/env python

import os
from flask import Flask
from flask import request
from flask_restful import Api

from fhir_river_api.src.config.logger import create_logger
from fhir_river_api.src.errors import OperationOutcome
from fhir_river_api.src.producer_class import RiverApiProducer
import uuid

logger = create_logger("fhir_river_api")

# Create flask app object
app = Flask(__name__)
api = Api(app)

producer = RiverApiProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


@app.route("/run_sample", methods=["POST"])
def trigger_sample_extractor():
    """
    Extract record for the specified resource and primary key value
    """
    body = request.get_json()
    resource_id = body.get("resource_id", None)
    primary_key_values = body.get("primary_key_values", None)
    batch_id = uuid.uuid4().hex

    try:
        create_extractor_trigger(resource_id, batch_id, primary_key_values)
        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


@app.route("/run_batch", methods=["POST"])
def trigger_batch_extractor():
    """
    Extract all records for the specified resources
    """
    body = request.get_json()
    resource_ids = body.get("resource_ids", None)
    batch_id = uuid.uuid4().hex

    try:
        for resource_id in resource_ids:
            create_extractor_trigger(resource_id, batch_id)
        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


@app.errorhandler(OperationOutcome)
def handle_bad_request(e):
    return str(e), 400


def create_extractor_trigger(resource_id, batch_id=None, primary_key_values=None):
    """
    Produce event to trigger extractor
    :param batch_id:
    :param resource_id:
    :param primary_key_values:
    :return:
    """

    event = dict()
    event["batch_id"] = batch_id
    event["resource_id"] = resource_id
    event["primary_key_values"] = primary_key_values

    producer.produce_event(topic="extractor_trigger", event=event)


if __name__ == "__main__":
    app.run(host="fhir_river_api", port=5000)
