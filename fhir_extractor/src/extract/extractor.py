from typing import List

import pandas as pd
import logging

from sqlalchemy import create_engine, MetaData, Table, Column as AlchemyColumn
from sqlalchemy.orm import sessionmaker, Query

from fhir_extractor.src.analyze.sql_column import SqlColumn
from fhir_extractor.src.analyze.sql_join import SqlJoin
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.clean.dataframe import clean_dataframe, squash_rows, merge_dataframe

logger = create_logger('fhir_extractor')

SQL_RELATIONS_TO_METHOD = {
    "<": "__lt__",
    "<=": "__le__",
    "<>": "__ne__",
    "=": "__eq__",
    ">": "__gt__",
    ">=": "__ge__",
    # not handled yet
    # "BETWEEN": "",
    "IN": "in_",
    "LIKE": "like",
}
DB_DRIVERS = {"POSTGRES": "postgresql", "ORACLE": "oracle+cx_oracle"}


class Extractor:
    def __init__(self, engine):
        self.engine = engine
        self.metadata = MetaData(bind=self.engine)
        self.session = sessionmaker(self.engine)()

    def extract(self, resource_mapping, analysis, pk_values=None):
        """ Main method of the Extractor class.
        It builds the sql alchemy query that will fetch the columns needed from the
        source DB, run it and return the result as a pandas dataframe.

        Args:
            resource_mapping: the mapping.
            analysis: an Analyis instance built by the Analyzer.
            pk_values: it not None, the Extractor will fetch only the rows for which
                the primary key values are in pk_values.

        Returns:
            a pandas dataframe where there all the columns asked for in the mapping
        """
        logging.info(f"Extracting resource: {resource_mapping['definitionId']}")

        # Build sqlalchemy query
        query = self.sqlalchemy_query(
            analysis.columns,
            analysis.joins,
            analysis.primary_key_column,
            resource_mapping,
            pk_values,
        )

        return self.run_sql_query(query)

    def sqlalchemy_query(
        self,
        columns: List[SqlColumn],
        joins: List[SqlJoin],
        pk_column: SqlColumn,
        resource_mapping,
        pk_values,
    ) -> Query:
        """ Builds an sql alchemy query which will be run in run_sql_query.
        """
        alchemy_cols = self.get_columns(columns)
        base_query = self.session.query(*alchemy_cols)
        query_w_joins = self.apply_joins(base_query, joins)
        query_w_filters = self.apply_filters(query_w_joins, resource_mapping, pk_column, pk_values)

        return query_w_filters

    def apply_joins(self, query: Query, joins: List[SqlJoin]) -> Query:
        """ Augment the sql alchemy query with joins from the analysis.
        """
        for join in joins:
            foreign_table = self.get_table(join.right)
            query = query.join(
                foreign_table,
                self.get_column(join.right) == self.get_column(join.left),
                isouter=True,
            )
        return query

    def apply_filters(
        self, query: Query, resource_mapping, pk_column: SqlColumn, pk_values
    ) -> Query:
        """ Augment the sql alchemy query with filters from the analysis.
        """
        if pk_values is not None:
            query = query.filter(self.get_column(pk_column).in_(pk_values))

        if resource_mapping["filters"]:
            for filter in resource_mapping["filters"]:
                col = self.get_column(
                    SqlColumn(
                        filter["sqlColumn"]["table"],
                        filter["sqlColumn"]["column"],
                        filter["sqlColumn"]["owner"],
                    )
                )
                rel_method = SQL_RELATIONS_TO_METHOD[filter["relation"]]
                query = query.filter(getattr(col, rel_method)(filter["value"]))

        return query

    def run_sql_query(self, query):
        """
        Run a sql query after opening a sql connection

        args:
            query (str): a sql query to run
            connection_type (str): the connection type / database to use

        return:
            the result of the sql query
        """
        query = query.statement
        logging.info(f"sql query: {query}")

        pd_query = pd.read_sql_query(query, con=self.engine)

        return pd.DataFrame(pd_query)

    def get_columns(self, columns: List[SqlColumn]) -> List[AlchemyColumn]:
        """ Get the sql alchemy columns corresponding to the SqlColumns (custom type)
        from the analysis.
        """
        return [self.get_column(col) for col in columns]

    def get_column(self, column: SqlColumn) -> AlchemyColumn:
        """ Get the sql alchemy column corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        table = self.get_table(column)
        # Note that we label the column manually to avoid collisions and
        # sqlAlchemy automatic labelling
        return table.c[column.column].label(column.dataframe_column_name())

    def get_table(self, column: SqlColumn) -> Table:
        """ Get the sql alchemy table corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        return Table(
            column.table, self.metadata, schema=column.owner, keep_existing=True, autoload=True
        )

    @staticmethod
    def convert_df_to_list_records(df, analysis):
        """
        Clean dataframe.
        Mainly here because of the sqaush_rows for the moment.
        """
        # TODO This shouldn't be in the extract
        # Change not string value to strings (to be validated by jsonSchema for resource)
        df = df.applymap(lambda value: str(value) if value is not None else None)

        # Apply cleaning scripts and concept map on df
        df = clean_dataframe(df, analysis.attributes, analysis.primary_key_column)

        # Apply join rule to merge some lines from the same resource
        logging.info("Squashing rows...")
        df = squash_rows(df, analysis.squash_rules)

        # Apply merging scripts on df
        df = merge_dataframe(df, analysis.attributes, analysis.primary_key_column)

        # TODO we cannot serialize the dataframe with keys being objects
        # is path sufficient or do we want something to better identify the original 
        # Attribute and retrieve it in the Transformer?
        df.columns = [attr.path for attr in df.columns]
        return df.to_dict(orient='records')
