#!/usr/bin/env python

import os
import json
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_sqlalchemy import SQLAlchemy

from fhir_extractor.src.extract import Extractor
from fhir_extractor.src.analyze import Analyzer

from fhir_extractor.src.analyze.mapping import get_mapping
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.config.database_config import DatabaseConfig
from fhir_extractor.src.helper import get_topic_name
from fhir_extractor.src.producer_class import ExtractorProducer

logger = create_logger("fhir_extractor")

# Create flask app object
app = Flask(__name__)
api = Api(app)

app.config.from_object(DatabaseConfig)
db = SQLAlchemy(app)

producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


@app.route("/extractor_sql/<resource_id>/<primary_key_value>", methods=["POST"])
def extractor_sql_single(resource_id, primary_key_value):
    """
    Extract record for the specified resource and primary key value
    :param resource_id:
    :param primary_key_value:
    :return:
    """
    try:
        # TODO factorize this somewhere
        # TODO this routes only makes sense with a single resource mapping.
        # This is mocked here by taking only the first resource mapping of the file.
        # We should have a get_resource_mapping_by_id or something like that using resource_id.
        resource_mapping = get_mapping(from_file="mapping_files/patient_mapping.json")[0]

        resource_type = resource_mapping["definition"]["id"]

        analyzer = Analyzer()
        extractor = Extractor(engine=db.engine)

        # Analyze
        analysis = analyzer.analyze(resource_mapping)
        # serialize important part of the analysis for the Transformer
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

        # Extract
        df = extractor.extract(resource_mapping, analysis, [primary_key_value])
        record = extractor.convert_df_to_list_records(df, analysis)[0]

        event = {}
        event["resource_type"] = resource_type
        event["record"] = record
        event["analysis"] = serialized_analysis

        topic = get_topic_name("mimic", resource_type, "extract")
        producer.produce_event(topic=topic, event=event)

        return "Success", 200

    except TypeError as error:
        return error.args[0], 500


@app.route("/extractor_sql", methods=["POST"])
def extractor_sql_batch():
    """
    Extract all records for the specified resource
    """
    try:
        # TODO factorize this somewhere
        # Get the resources we want to process from the pyrog mapping for a given source
        resources = get_mapping(from_file="mapping_files/patient_mapping.json")

        analyzer = Analyzer()
        extractor = Extractor(engine=db.engine)

        for resource_mapping in resources:
            resource_type = resource_mapping["definition"]["id"]
            # Analyze
            analysis = analyzer.analyze(resource_mapping)
            # serialize important part of the analysis for the Transformer
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

            # Extract
            df = extractor.extract(resource_mapping, analysis)
            list_records_from_db = extractor.convert_df_to_list_records(df, analysis)

            for record in list_records_from_db:
                event = {}
                event["resource_type"] = resource_type
                event["record"] = record
                event["analysis"] = serialized_analysis

                topic = get_topic_name("mimic", resource_type, "extract")
                producer.produce_event(topic=topic, event=event)

        return "Success", 200

    except TypeError as error:
        return error.args[0], 500


if __name__ == "__main__":
    app.run(host="fhir_extractor", port=5000)
