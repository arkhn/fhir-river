#!/usr/bin/env python

import os
import json
import datetime
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_sqlalchemy import SQLAlchemy
from fhir_extractor.src.producer_class import ExtractorProducer
from fhir_extractor.src.query_db import ExtractorSQL
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.config.database_config import DatabaseConfig
from fhir_extractor.src.helper import default_json_encoder, get_topic_name

logging = create_logger('fhir_extractor')

# Create flask app object
app = Flask(__name__)
api = Api(app)

app.config.from_object(DatabaseConfig)
db = SQLAlchemy(app)

producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))

# PYROG PROXY

MAPPING_SINGLE = {
    'patients': """SELECT  icustays.hadm_id AS icustays_hadm_id,
                                    patients.dod AS patients_dod,
                                    patients.expire_flag AS patients_expire_flag,
                                    patients.gender AS patients_gender, 
                                    patients.subject_id AS patients_subject_id,
                                    admissions.marital_status AS admissions_marital_status, 
                                    patients.dob AS patients_dob,
                                    patients.row_id AS patients_row_id
                            FROM patients 
                                LEFT OUTER JOIN icustays 
                                    ON icustays.subject_id = patients.subject_id 
                                LEFT OUTER JOIN admissions 
                                    ON admissions.subject_id = patients.subject_id 
                            WHERE patients.subject_id = %(primary_key_value)s;"""}

MAPPING_BATCH = {
    'patients': """SELECT  icustays.hadm_id AS icustays_hadm_id,
                                    patients.dod AS patients_dod,
                                    patients.expire_flag AS patients_expire_flag,
                                    patients.gender AS patients_gender, 
                                    patients.subject_id AS patients_subject_id,
                                    admissions.marital_status AS admissions_marital_status, 
                                    patients.dob AS patients_dob,
                                    patients.row_id AS patients_row_id
                            FROM patients 
                                LEFT OUTER JOIN icustays 
                                    ON icustays.subject_id = patients.subject_id 
                                LEFT OUTER JOIN admissions 
                                    ON admissions.subject_id = patients.subject_id;"""}


@app.route("/extractor_sql/<resource_id>/<primary_key_value>", methods=["POST"])
def extractor_sql_single(resource_id, primary_key_value):
    """
    Extract record for the specified resource and primary key value
    :param resource_id:
    :param primary_key_value:
    :return:
    """
    try:
        sql = MAPPING_SINGLE[resource_id]
        params = {'primary_key_value': int(primary_key_value)}
        extractor_class = ExtractorSQL(sql=sql, params=params, con=db.engine)
        list_records_from_db = extractor_class()
        for record in list_records_from_db:
            record['resource_id'] = resource_id
            topic = get_topic_name('mimic', resource_id, 'extract')
            producer.produce_event(topic=topic, record=json.dumps(record, default=default_json_encoder))
        return 'Success', 200
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
        sql = MAPPING_BATCH[resource_id]
        extractor_class = ExtractorSQL(sql=sql, con=db.engine)
        list_records_from_db = extractor_class()
        for record in list_records_from_db:
            record['resource_id'] = resource_id
            topic = get_topic_name('mimic', resource_id, 'extract')
            producer.produce_event(topic=topic, record=json.dumps(record, default=default_json_encoder))
        return 'Success', 200
    except TypeError as error:
        return error.args[0], 500


if __name__ == "__main__":
    app.run(host='fhir_extractor', port=5000)
