#!/usr/bin/env python

import os
from flask import Flask
from flask import request
from flask_restful import Api

from fhir_river_api.src.config.logger import create_logger
from fhir_river_api.src.errors import OperationOutcome
from fhir_river_api.src.producer_class import RiverApiProducer
import time

logger = create_logger("fhir_river_api")

# Create flask app object
app = Flask(__name__)
api = Api(app)

producer = RiverApiProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


@app.route("/run_sample", methods=["POST"])
def trigger_sample_extractor():
    """
    Extract all records for the specified resource
    """
    body = request.get_json()
    resource_id = body.get("resourceId", None)
    primary_key_values = body.get("primaryKeyValues", None)
    batch_id = "batch_{time_sec}".format(time_sec=round(time.time()))

    try:
        create_extractor_trigger(resource_id, batch_id, primary_key_values)
        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


@app.route("/run_batch", methods=["POST"])
def trigger_batch_extractor():
    """
    Extract all records for the specified resource
    """
    body = request.get_json()
    resource_ids = body.get("resourceIds", None)
    batch_id = "batch_{time_sec}".format(time_sec=round(time.time()))

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
    event['batch_id'] = batch_id
    event['resource_id'] = resource_id
    event['primary_key_values'] = primary_key_values

    producer.produce_event(topic='extractor_trigger', event=event)


if __name__ == "__main__":
    app.run(host="fhir_river_api", port=5000)
