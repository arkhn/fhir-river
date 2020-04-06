#!/usr/bin/env python

import os
import json
import datetime
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_sqlalchemy import SQLAlchemy
from extractor_app.src.producer_class import ExtractorProducer, callback_fn
from extractor_app.src.query_db import ExtractorSQL
from extractor_app.src.config.logger import create_logger
from extractor_app.src.config.database_config import DatabaseConfig

logging = create_logger('extractor_sql')

# Create flask app object
app = Flask(__name__)
api = Api(app)

app.config.from_object(DatabaseConfig)
db = SQLAlchemy(app)

producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
                             callback_function=callback_fn)

# PYROG PROXY

MAPPING_SINGLE = {
    'mimic-admissions': "SELECT subject_id, admission_type, admittime FROM admissions WHERE subject_id = %(primary_key_value)s;"}

MAPPING_BATCH = {
    'mimic-admissions': "SELECT subject_id, admission_type, admittime FROM admissions LIMIT 100;"}


def default_json_encoder(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()


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
            producer.produce_event(topic=resource_id, record=json.dumps(record, default=default_json_encoder))
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
            producer.produce_event(topic=resource_id, record=json.dumps(record))
        return 'Success', 200
    except TypeError as error:
        return error.args[0], 500


if __name__ == "__main__":
    app.run(host='extractor_app', port=5000)
