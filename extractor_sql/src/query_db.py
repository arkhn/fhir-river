#!/usr/bin/env python

import psycopg2
import pandas as pd


class ExtractorSQL:
    """
    Extractor SQL class
    """

    def __init__(self, sql):
        """
        Init Class
        """
        self.sql = sql
        self.connection = psycopg2.connect(user="mimicuser",
                                           password="mimicuser",
                                           host="localhost",
                                           port="5431",
                                           database="mimic")

    def __call__(self, *args, **kwargs):
        """
        Return list fo records when calling the class
        :param args:
        :param kwargs:
        :return:
        """
        df = self.read_sql_df()
        return self.convert_df_to_list_records(df)

    def read_sql_df(self):
        """
        Read SQL query or database table into a DataFrame.
        :return:
        """
        try:
            df = pd.read_sql(self.sql, self.connection)
            return df
        except (Exception, psycopg2.Error) as err:
            print("Error while reading from db: {}".format(err))

    @staticmethod
    def convert_df_to_list_records(df):
        """
        Convert a pandas dataframe to a list of records
        :return:
        """
        return df.to_dict(orient='records')
