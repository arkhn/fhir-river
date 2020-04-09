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


@app.route("/extractor_sql", methods=["POST"])
def extractor_sql_batch():
    """
    Extract all records for the specified resource
    """
    body = request.get_json()
    resource_ids = body.get("resourceIds", None)

    try:
        # Get the resources we want to process from the pyrog mapping for a given source
        resources = get_mapping(resource_ids=resource_ids)

        for resource_mapping in resources:
            analysis = analyzer.analyze(resource_mapping)

            run_resource(resource_mapping, analysis)

        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


@app.route("/extractor_sql/<resource_id>/<primary_key_value>", methods=["POST"])
def extractor_sql_single(resource_id, primary_key_value):
    """
    Extract record for the specified resource and primary key value
    :param resource_id:
    :param primary_key_value:
    :return:
    """
    try:
        resource_mapping = get_resource_from_id(resource_id=resource_id)
        analysis = analyzer.analyze(resource_mapping)

        run_resource(resource_mapping, analysis, [primary_key_value])

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

    # Extract
    df = extractor.extract(resource_mapping, analysis, primary_key_values)
    if df.empty:
        raise ValueError(
            "The sql query returned nothing. Maybe the primary key values "
            "you provided are not present in the database or the mapping "
            "is erroneous."
        )

    list_records_from_db = extractor.convert_df_to_list_records(df, analysis)

    # serialize important part of the analysis for the Transformer
    serialized_analysis = serialize_analysis(analysis, resource_mapping)

    for record in list_records_from_db:
        event = {}
        event["resource_type"] = resource_type
        event["record"] = record
        event["analysis"] = serialized_analysis

        topic = get_topic_name("mimic", resource_type, "extract")
        producer.produce_event(topic=topic, event=event)


def serialize_analysis(analysis, resource_mapping):
    """
    Just a convenient helper function for now.
    It shouldn't be used after the POC.
    """
    # TODO it's pretty gross to serialize and deserialize like this by hand
    serialized_analysis = {}
    serialized_analysis["attributes"] = [
        (attr.path, attr.static_inputs) for attr in analysis.attributes
    ]
    serialized_analysis["source_id"] = resource_mapping["source"]["id"]
    serialized_analysis["resource_id"] = resource_mapping["id"]
    serialized_analysis["definition"] = {
        "type": resource_mapping["definition"]["type"],
        "kind": resource_mapping["definition"]["kind"],
        "derivation": resource_mapping["definition"]["derivation"],
        "url": resource_mapping["definition"]["url"],
    }
    return serialized_analysis


if __name__ == "__main__":
    app.run(host="fhir_extractor", port=5000)
