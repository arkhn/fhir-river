"""
Create Records Db
"""

import random
import psycopg2
import time


def exec_sql(sql):
    """
    Create connection pool
    :return:
    """
    try:
        # Create Connection Pool object
        connection = psycopg2.connect(user="mimicuser",
                                      password="mimicuser",
                                      host="localhost",
                                      port="5431",
                                      database="mimic")
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()

    except (Exception, psycopg2.Error) as err:
        print("Error while upserting to PostgreSQL: {}".format(err))
    finally:
        if (connection):
            cursor.close()
            connection.close()


def convert_epoch_to_datetime(epoch_time):
    """
    Convert epoch time to datetime string
    :param epoch_time:
    :return:
    """
    return time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(epoch_time))


TABLE = "admissions"
COLUMN_NAME = ['row_id', 'subject_id', 'hadm_id', 'admittime', 'dischtime', 'deathtime', 'admission_type',
               'admission_location', 'discharge_location', 'insurance', 'language', 'religion', 'marital_status',
               'ethnicity', 'edregtime', 'edouttime', 'diagnosis', 'hospital_expire_flag', 'has_chartevents_data']

RECORD = [int(time.time()),
          44228,
          103379 + int(1000 * random.random()),  # random id
          convert_epoch_to_datetime(time.time()),
          convert_epoch_to_datetime(time.time()),
          convert_epoch_to_datetime(time.time()),
          'EMERGENCY', 'EMERGENCY ROOM ADMIT', 'HOME HEALTH CARE', 'Private', 'ENGL', 'NOT SPECIFIED', 'SINGLE',
          'WHITE', convert_epoch_to_datetime(time.time()), convert_epoch_to_datetime(time.time()), 'CHOLANGITIS', 0, 1]

INSERT_QUERY = """INSERT INTO {table} ({columns}) VALUES {record};""".format(table=TABLE,
                                                                             columns=', '.join(COLUMN_NAME),
                                                                             record=tuple(RECORD))

print("Running Query...")
exec_sql(INSERT_QUERY)
print("Done")
