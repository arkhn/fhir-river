#!/usr/bin/env python

import os
from extractor_sql.src.producer_class import ExtractorProducer, callback_fn
from extractor_sql.src.query_db import ExtractorSQL
from extractor_sql.src.logger import create_logger

logging = create_logger('extractor_sql')

TOPIC = 'mimic-admissions-sql'
SQL = """SELECT subject_id, admittime, admission_type FROM admissions LIMIT 10;"""

if __name__ == '__main__':
    logging.info("Running Extractor")
    producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
                                 callback_function=callback_fn)
    list_records_from_db = ExtractorSQL(SQL)()
    for record in list_records_from_db:
        producer.produce_event(topic=TOPIC, record=record)
