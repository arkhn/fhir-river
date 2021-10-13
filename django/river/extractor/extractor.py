import logging
from collections import defaultdict
from typing import Any, Dict, Generator, List, Optional

from arkhn_monitoring import Timer
from prometheus_client import Counter as PromCounter
from river.common.analyzer.analysis import Analysis
from river.extractor.query_builder import QueryBuilder
from sqlalchemy import MetaData
from sqlalchemy.orm import Query, Session

logger = logging.getLogger(__name__)

# CHUNK_SIZE is the argument we give to sqlalchemy's Query.yield_per
# Rows will be loaded by batches of length CHUNK_SIZE. This avoids
# filling up all the RAM with huge tables.
CHUNK_SIZE = 10_000

counter_extract_instances = PromCounter(
    "count_extracted_instances",
    "Number of resource instances extracted",
    labelnames=("resource_id", "resource_type"),
)


class Extractor:
    def __init__(self, session: Session, metadata: MetaData):
        self.session = session
        self.metadata = metadata

    @Timer("time_extractor_extract", "time to perform extract method of Extractor")
    def extract(self, analysis: Analysis, pk_values: Optional[List[Any]] = None):
        """Main method of the Extractor class.
        It builds the sql alchemy query that will fetch the columns needed from the
        project DB, run it and returns the result as an sqlalchemy ResultProxy.

        Args:
            analysis: an Analyis instance built by the Analyzer.
            pk_values: it not None, the Extractor will fetch only the rows for which
                the primary key values are in pk_values.

        Returns:
            a an sqlalchemy RestulProxy containing all the columns asked for in the
            mapping
        """
        logger.info(
            {
                "message": f"Start extracting resource: {analysis.definition_id}",
                "resource_id": analysis.resource_id,
            },
        )

        # Build sqlalchemy query
        builder = QueryBuilder(
            session=self.session,
            metadata=self.metadata,
            analysis=analysis,
            pk_values=pk_values,
        )
        query = builder.build_query()

        return self.run_sql_query(query)

    @Timer("time_extractor_run_query", "time to run sql query")
    def run_sql_query(self, query: Query, resource_id: Optional[str] = None):
        """
        Run a sql query after opening a sql connection

        args:
            query (str): a sql query to run
            resource_id (str, optional): the id of the resource being processed, for
            logging

        return:
            the result of the sql query
        """
        logger.info(
            {
                "message": f"Executing query: {query.statement}",
                "resource_id": resource_id,
            }
        )

        return query.yield_per(CHUNK_SIZE)

    @staticmethod
    @Timer("time_extractor_split", "time to split dataframe")
    def split_dataframe(df: Query, analysis: Analysis) -> Generator[Dict[str, list], None, None]:
        # Find primary key column
        logger.info(
            {
                "message": f"Splitting dataframe for resource {analysis.definition_id}",
                "resource_id": analysis.resource_id,
            },
        )

        pk_col = analysis.primary_key_column.dataframe_column_name()

        prev_pk_val = None
        acc = defaultdict(list)

        for row in df:
            # When iterating on a sqlalchemy Query, we get rows (actually sqlalchemy
            # results) that behaves like tuples and have a `keys` methods returning the
            # column names in the same order as they are in the tuple.
            # For instance a row could look like: ("bob", 34)
            # and its `keys` method could return: ["name", "age"]
            pk_ind = row.keys().index(pk_col)
            if acc and row[pk_ind] != prev_pk_val:
                counter_extract_instances.labels(
                    resource_id=analysis.resource_id,
                    resource_type=analysis.definition_id,
                ).inc()
                yield dict(acc)
                acc = defaultdict(list)
            for key, value in zip(row.keys(), row):
                acc[key].append(value)

            prev_pk_val = row[pk_ind]

        if not acc:
            logger.warning(
                "The sql query returned nothing. Maybe the primary key values "
                "you provided are not present in the database or the mapping "
                "is erroneous."
            )
        else:
            counter_extract_instances.labels(
                resource_id=analysis.resource_id,
                resource_type=analysis.definition_id,
            ).inc()
            yield dict(acc)
