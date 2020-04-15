#!/usr/bin/env python

import os
import json
from flask import Flask
from flask import request
from flask_restful import Resource, Api, reqparse
from flask_sqlalchemy import SQLAlchemy

from fhir_extractor.src.extract import Extractor
from fhir_extractor.src.analyze import Analyzer

from fhir_extractor.src.analyze.mapping import get_mapping
from fhir_extractor.src.analyze.graphql import get_resource_from_id
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.config.database_config import DatabaseConfig
from fhir_extractor.src.errors import OperationOutcome
from fhir_extractor.src.helper import get_topic_name
from fhir_extractor.src.producer_class import ExtractorProducer

logger = create_logger("fhir_extractor")

# Create flask app object
app = Flask(__name__)
api = Api(app)

app.config.from_object(DatabaseConfig)
db = SQLAlchemy(app)

analyzer = Analyzer()
extractor = Extractor(engine=db.engine)
producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


@app.route("/batch", methods=["POST"])
def extractor_sql_batch():
    """
    Extract all records for the specified resource
    """
    body = request.get_json()
    resource_ids = body.get("resourceIds", None)
    logger.debug("Params obtained")
    try:
        # Get the resources we want to process from the pyrog mapping for a given source
        logger.debug("Getting Mapping")
        resources = get_mapping(resource_ids=resource_ids)

        for resource_mapping in resources:
            logger.debug("Analysing Resource")
            analysis = analyzer.analyze(resource_mapping)

            run_resource(resource_mapping, analysis)

        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


@app.route("/sample", methods=["POST"])
def extractor_sql_single():
    """
    Extract record for the specified resource and primary key value
    """
    body = request.get_json()
    resource_id = body.get("resourceId", None)
    primary_key_values = body.get("primaryKeyValues", None)
    logger.debug("Params obtained")
    try:
        logger.debug("Getting Mapping")
        resource_mapping = get_resource_from_id(resource_id=resource_id)
        analysis = analyzer.analyze(resource_mapping)

        run_resource(resource_mapping, analysis, primary_key_values)

        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


@app.errorhandler(OperationOutcome)
def handle_bad_request(e):
    return str(e), 400


def run_resource(resource_mapping, analysis, primary_key_values=None):
    """
    """
    resource_type = resource_mapping["definitionId"]
    resource_id = resource_mapping["id"]

    # Extract
    df = extractor.extract(resource_mapping, analysis, primary_key_values)
    if df.empty:
        raise ValueError(
            "The sql query returned nothing. Maybe the primary key values "
            "you provided are not present in the database or the mapping "
            "is erroneous."
        )

    list_records_from_db = extractor.split_dataframe(df, analysis)

    # serialize important part of the analysis for the Transformer
    # serialized_analysis = serialize_analysis(analysis, resource_mapping)
    for record in list_records_from_db:
        logger.debug("One record from extract")
        event = dict()
        event["resource_type"] = resource_type
        event["resource_id"] = resource_id
        event["dataframe"] = record.to_dict(orient="list")

        topic = get_topic_name("mimic", resource_type, "extract")
        producer.produce_event(topic=topic, event=event)


if __name__ == "__main__":
    app.run(host="fhir_extractor", port=5000)
