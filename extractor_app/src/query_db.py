#!/usr/bin/env python

import psycopg2
import pandas as pd

from extractor_app.src.config.logger import create_logger

logger = create_logger('extractor_sql')


class ExtractorSQL:
    """
    Extractor SQL class
    """

    def __init__(self, sql, params=None, con=None):
        """
        Init Class
        """
        self.sql = sql
        self.params = params
        self.con = con

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

        df = pd.read_sql(sql=self.sql, con=self.con, params=self.params)
        return df

    @staticmethod
    def convert_df_to_list_records(df):
        """
        Convert a pandas dataframe to a list of records
        :return:
        """
        return df.to_dict(orient='records')
