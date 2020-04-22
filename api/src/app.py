#!/usr/bin/env python

import os
from flask import Flask, request, jsonify
import requests

from api.src.config.logger import create_logger
from api.src.errors import OperationOutcome
from api.src.producer_class import RiverApiProducer
import uuid

logger = create_logger("api")

# Create flask app object
app = Flask(__name__)

producer = RiverApiProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
EXTRACTOR_URL = os.getenv("EXTRACTOR_URL")
TRANSFORMER_URL = os.getenv("TRANSFORMER_URL")


@app.route("/preview", methods=["POST"])
def trigger_sample_extractor():
    """
    Extract record for the specified resource and primary key value
    """
    body = request.get_json()
    resource_id = body.get("resource_id", None)
    primary_key_values = body.get("primary_key_values", None)
    logger.debug("PREVIEW %s %s", resource_id, primary_key_values)

    try:
        extract_resp = requests.post(
            f"{EXTRACTOR_URL}/extract",
            json={"resource_id": resource_id, "primary_key_values": primary_key_values},
        )
        if extract_resp.status_code != 200:
            raise Exception(
                f"Failed while extracting data: {extract_resp.content.decode('utf-8')}."
            )

        rows = extract_resp.json()["rows"]
        transform_resp = requests.post(
            f"{TRANSFORMER_URL}/transform", json={"resource_id": resource_id, "dataframe": rows},
        )
        if transform_resp.status_code != 200:
            raise Exception(
                f"Failed while transforming data: {transform_resp.content.decode('utf-8')}."
            )
        return jsonify(transform_resp.json())

    except Exception as e:
        raise OperationOutcome(e)


@app.route("/batch", methods=["POST"])
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
    app.run(host="api", port=5000)
