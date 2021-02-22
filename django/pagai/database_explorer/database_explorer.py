from collections import defaultdict
from typing import Callable, Dict, List

from common.analyzer.sql_filter import SqlFilter
from common.database_connection.db_connection import ORACLE, ORACLE11, DBConnection
from pagai.errors import ExplorationError
from sqlalchemy import Column, Table, and_, text
from sqlalchemy.exc import InvalidRequestError


def handle_between_filter(col, value):
    values = value.split(",")
    if len(values) != 2:
        raise ValueError("BETWEEN filter expects 2 values separated by a comma.")
    min_val = values[0].strip()
    max_val = values[1].strip()
    return and_(col.__ge__(min_val), col.__le__(max_val))


SQL_RELATIONS_TO_METHOD: Dict[str, Callable[[Column, str], Callable]] = {
    "<": lambda col, value: col.__lt__(value),
    "<=": lambda col, value: col.__le__(value),
    "<>": lambda col, value: col.__ne__(value),
    "=": lambda col, value: col.__eq__(value),
    ">": lambda col, value: col.__gt__(value),
    ">=": lambda col, value: col.__ge__(value),
    "BETWEEN": handle_between_filter,
    "IN": lambda col, value: col.in_(value.split(",")),
    "LIKE": lambda col, value: col.like(value),
}


class DatabaseExplorer:
    def __init__(self, db_connection: DBConnection):
        self.db_connection = db_connection
        self.db_schema = {}

    def get_table_rows(self, session, owner: str, table_name: str, limit: int = 100, filters: List[SqlFilter] = []):
        """
        Return content of a table with a limit
        """
        columns_names = self.get_owner_schema(owner)[table_name]

        table = self.get_sql_alchemy_table(owner, table_name)
        columns = [self.get_sql_alchemy_column(col, table) for col in columns_names]
        select = session.query(*columns)

        # Add filtering if any
        for filter_ in filters:
            table = self.get_sql_alchemy_table(filter_.sql_column.owner, filter_.sql_column.table)
            col = self.get_sql_alchemy_column(filter_.sql_column.column, table)
            filter_clause = SQL_RELATIONS_TO_METHOD[filter_.relation](col, filter_.value)
            select = select.filter(filter_clause)

            # Add joins if any
            last_link = None
            for join in filter_.sql_column.joins:
                left_table = (
                    last_link
                    if last_link is not None
                    else self.get_sql_alchemy_table(join.left.owner, join.left.table)
                )
                right_table = self.get_sql_alchemy_table(join.right.owner, join.right.table)
                last_link = right_table

                select = select.join(
                    right_table,
                    self.get_sql_alchemy_column(join.left.column, right_table)
                    == self.get_sql_alchemy_column(join.right.column, left_table),
                    isouter=True,
                )

        # Return as JSON serializable object
        return {"fields": columns_names, "rows": [list(row) for row in select.limit(limit).all()]}

    def explore(self, owner: str, table_name: str, limit: int, filters: List[SqlFilter] = []):
        """
        Returns the first rows of a table alongside the column names.
        """
        with self.db_connection.session_scope() as session:
            try:
                return self.get_table_rows(
                    session=session,
                    owner=owner,
                    table_name=table_name,
                    limit=limit,
                    filters=filters,
                )
            except InvalidRequestError as e:
                if "requested table(s) not available" in str(e):
                    raise ExplorationError(f"Table {table_name} does not exist in database")
                else:
                    raise ExplorationError(e)
            except Exception as e:
                raise ExplorationError(e)

    def get_owners(self):
        """
        Returns all owners of a database.
        """
        if self.db_connection._db_model in [ORACLE, ORACLE11]:
            sql_query = text("select username as owners from all_users")
        else:  # POSTGRES AND MSSQL
            sql_query = text("select schema_name as owners from information_schema.schemata;")

        with self.db_connection.engine.connect() as connection:
            result = connection.execute(sql_query).fetchall()
            return [r["owners"] for r in result]

    def get_owner_schema(self, owner: str):
        """
        Returns the database schema for one owner of a database,
        as required by Pyrog.
        """
        if self.db_schema.get(owner):
            return self.db_schema[owner]

        schema = defaultdict(list)

        if self.db_connection._db_model in [ORACLE, ORACLE11]:
            sql_query = text(f"select table_name, column_name from all_tab_columns where owner='{owner}'")
        else:  # POSTGRES AND MSSQL
            sql_query = text(
                f"select table_name, column_name from information_schema.columns where table_schema='{owner}';"
            )

        with self.db_connection.engine.connect() as connection:
            result = connection.execute(sql_query).fetchall()
            for row in result:
                schema[row["table_name"]].append(row["column_name"])

        self.db_schema[owner] = schema
        return schema

    def get_sql_alchemy_table(self, owner: str, table: str):
        return Table(table.strip(), self.db_connection.metadata, schema=owner, autoload=True)

    def get_sql_alchemy_column(self, column: str, sqlalchemy_table: Table):
        """
        Return column names of a table
        """
        try:
            return sqlalchemy_table.c[column]
        except KeyError:
            # If column is not in table.c it may be because the column names
            # are case insensitive. If so, the schema can be in upper case
            # (what oracle considers as case insensitive) but the keys
            # in table.c are in lower case (what sqlalchemy considers
            # as case insensitive).
            return sqlalchemy_table.c[column.lower()]
