from collections import defaultdict
from typing import Callable, Dict, List, Mapping

from common.analyzer.sql_filter import SqlFilter
from pagai.errors import ExplorationError
from sqlalchemy import Column, MetaData, Table, and_, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import InvalidRequestError
from utils.session import Session


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


class ExplorerBase:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    def list_available_schema(self) -> List[str]:
        raise NotImplementedError

    def get_schema(self, schema: str) -> Mapping[str, List[str]]:
        raise NotImplementedError

    def list_rows(self, session: Session, schema: str, table_name: str, limit: int = 100) -> List:
        raise NotImplementedError


class SimpleExplorer(ExplorerBase):
    def list_available_schema(self) -> List[str]:
        inspector = inspect(self.engine)
        return inspector.get_schema_names()

    def get_metadata(self, schema: str) -> MetaData:
        metadata = MetaData()
        metadata.reflect(bind=self.engine, schema=schema)
        return metadata

    def get_table(self, schema: str, name: str) -> Table:
        metadata = MetaData()
        return Table(name, metadata, schema=schema, autoload=True, autoload_with=self.engine)

    def get_schema(self, schema: str) -> Mapping[str, List[str]]:
        metadata = self.get_metadata(schema=schema)
        return {name: [column.name for column in table.columns] for name, table in metadata.tables.items()}

    def list_rows(
        self, session: Session, schema: str, table_name: str, limit: int = 100, filters: List[SqlFilter] = []
    ) -> dict:
        table = self.get_table(schema=schema, name=table_name)
        query = session.query(table)

        # Add filtering if any
        for filter_ in filters:
            table = self.get_table(schema=filter_.sql_column.owner, name=filter_.sql_column.table)
            column = table.columns[filter_.sql_column.column]
            filter_clause = SQL_RELATIONS_TO_METHOD[filter_.relation](column, filter_.value)
            query = query.filter(filter_clause)

            # Add joins if any
            last_link = None
            for join in filter_.sql_column.joins:
                left_table = (
                    last_link
                    if last_link is not None
                    else self.get_table(schema=join.left.owner, name=join.left.table)
                )
                right_table = self.get_table(schema=join.right.owner, name=join.right.table)
                last_link = right_table

                query = query.join(
                    right_table,
                    right_table.columns[join.left.column] == left_table.columns[join.right.column],
                    isouter=True,
                )

        return {
            "fields": [column_desc["name"] for column_desc in query.column_descriptions],
            "rows": [list(row) for row in query.limit(limit).all()],
        }


class DatabaseExplorer:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine
        self.metadata = MetaData(bind=engine)
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
                    self.get_sql_alchemy_column(join.right.column, right_table)
                    == self.get_sql_alchemy_column(join.left.column, left_table),
                    isouter=True,
                )

        # Return as JSON serializable object
        return {"fields": columns_names, "rows": [list(row) for row in select.limit(limit).all()]}

    def explore(self, owner: str, table_name: str, limit: int, filters: List[SqlFilter] = []):
        """
        Returns the first rows of a table alongside the column names.
        """
        session = Session()
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
        finally:
            session.close()

    def get_owners(self):
        """
        Returns all owners of a database.
        """
        if self.engine.name == "oracle":
            sql_query = text("select username as owners from all_users")
        else:
            sql_query = text("select schema_name as owners from information_schema.schemata;")

        with self.engine.connect() as connection:
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

        if self.engine.name == "oracle":
            sql_query = text(f"select table_name, column_name from all_tab_columns where owner='{owner}'")
        else:
            sql_query = text(
                f"select table_name, column_name from information_schema.columns where table_schema='{owner}';"
            )

        with self.engine.connect() as connection:
            result = connection.execute(sql_query).fetchall()
            for row in result:
                schema[row["table_name"]].append(row["column_name"])

        self.db_schema[owner] = schema
        return schema

    def get_sql_alchemy_table(self, owner: str, table: str):
        return Table(table.strip(), self.metadata, schema=owner, autoload=True)

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
