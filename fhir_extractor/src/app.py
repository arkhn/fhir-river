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
        # Get the resources we want to process from the pyrog mapping for a given source
        # TODO Hard coded to take only the first resource of the mapping
        resource_mapping = get_mapping(from_file="mapping_files/patient_mapping.json")[0]

        analyzer = Analyzer()
        extractor = Extractor(engine=db.engine)

        # Analyze
        analysis = analyzer.analyze(resource_mapping)

        # Extract
        df = extractor.extract(resource_mapping, analysis, [primary_key_value])
        record = extractor.convert_df_to_list_records(df, analysis)[0]

        topic = get_topic_name("mimic", resource_id, "extract")
        producer.produce_event(topic=topic, record=record)

        return "Success", 200

    except TypeError as error:
        return error.args[0], 500


@app.route("/extractor_sql/<resource_id>", methods=["POST"])
def extractor_sql_batch(resource_id):
    """
    Extract all records for the specified resource
    :param resource_id:
    :return:
    """
    try:
        # TODO factorize this somewhere
        # Get the resources we want to process from the pyrog mapping for a given source
        # TODO Hard coded to take only the first resource of the mapping
        resources = get_mapping(from_file="mapping_files/patient_mapping.json")

        analyzer = Analyzer()
        extractor = Extractor(engine=db.engine)

        for resource_mapping in resources:
            # Analyze
            analysis = analyzer.analyze(resource_mapping)

            # Extract
            df = extractor.extract(resource_mapping, analysis)
            list_records_from_db = extractor.convert_df_to_list_records(df, analysis)

            for record in list_records_from_db:
                record["resource_id"] = resource_id
                topic = get_topic_name("mimic", resource_id, "extract")
                producer.produce_event(topic=topic, record=record)

        return "Success", 200

    except TypeError as error:
        return error.args[0], 500


if __name__ == "__main__":
    app.run(host="fhir_extractor", port=5000)
