from collections import Counter
from datetime import datetime
from unittest import TestCase

import pytest

from common.database_connection.db_connection import MSSQL, ORACLE, ORACLE11, POSTGRES, DBConnection
from pagai.database_explorer.database_explorer import DatabaseExplorer

pytestmark = pytest.mark.pagai

ALL_OWNERS_FOR_DBTYPE = {
    POSTGRES: ["pg_temp_1", "pg_toast_temp_1", "pg_toast", "pg_catalog", "public", "information_schema"],
    MSSQL: [
        "dbo",
        "guest",
        "INFORMATION_SCHEMA",
        "sys",
        "cdc",
        "db_owner",
        "db_accessadmin",
        "db_securityadmin",
        "db_ddladmin",
        "db_backupoperator",
        "db_datareader",
        "db_datawriter",
        "db_denydatareader",
        "db_denydatawriter",
    ],
    ORACLE11: [
        "XS$NULL",
        "APEX_040000",
        "APEX_PUBLIC_USER",
        "FLOWS_FILES",
        "HR",
        "MDSYS",
        "ANONYMOUS",
        "XDB",
        "CTXSYS",
        "OUTLN",
        "SYSTEM",
        "SYS",
    ],
    ORACLE: [
        "SYS",
        "AUDSYS",
        "SYSTEM",
        "SYSBACKUP",
        "SYSDG",
        "SYSKM",
        "SYSRAC",
        "OUTLN",
        "XS$NULL",
        "GSMADMIN_INTERNAL",
        "GSMUSER",
        "GSMROOTUSER",
        "DIP",
        "REMOTE_SCHEDULER_AGENT",
        "DBSFWUSER",
        "ORACLE_OCM",
        "SYS$UMF",
        "DBSNMP",
        "APPQOSSYS",
        "GSMCATUSER",
        "GGSYS",
        "XDB",
        "ANONYMOUS",
        "WMSYS",
        "MDDATA",
        "OJVMSYS",
        "CTXSYS",
        "ORDSYS",
        "ORDDATA",
        "ORDPLUGINS",
        "SI_INFORMTN_SCHEMA",
        "MDSYS",
        "OLAPSYS",
        "DVSYS",
        "LBACSYS",
        "DVF",
    ],
}


def verify_schema_structure(db_schema):
    assert isinstance(db_schema, dict)
    assert len(db_schema) > 0
    for table, rows in db_schema.items():
        assert isinstance(table, str)
        assert isinstance(rows, list)
        assert len(rows) > 0
        for row in rows:
            assert isinstance(row, str)


def test_explore(db_config):
    db_connection = DBConnection(db_config)
    explorer = DatabaseExplorer(db_connection)

    if db_config["model"] in [ORACLE11, ORACLE]:
        exploration = explorer.explore(owner=db_config["owner"], table_name="PATIENTS", limit=2)
        TestCase().assertCountEqual(exploration["fields"], ["index", "PATIENT_ID", "GENDER", "date"])
    else:
        exploration = explorer.explore(owner=db_config["owner"], table_name="patients", limit=2)
        TestCase().assertCountEqual(exploration["fields"], ["index", "patient_id", "gender", "date"])

    expected_rows = (
        ["F", datetime(1974, 3, 5, 0, 0), 0, 1],
        ["M", datetime(1969, 12, 21, 0, 0), 1, 2],
    )
    # Check that both expected rows are present in the result
    for expected_row in expected_rows:
        assert any(Counter(expected_row) == Counter(actual_row) for actual_row in exploration["rows"])


def test_owners(db_config):
    db_connection = DBConnection(db_config)
    explorer = DatabaseExplorer(db_connection)
    owners = explorer.get_owners()
    TestCase().assertCountEqual(owners, ALL_OWNERS_FOR_DBTYPE[db_config["model"]])


def test_get_owner_schema(db_config):
    db_connection = DBConnection(db_config)
    explorer = DatabaseExplorer(db_connection)
    db_schema = explorer.get_owner_schema(db_config["owner"])
    verify_schema_structure(db_schema)


def test_case_sensitivity(db_config):
    db_connection = DBConnection(db_config)
    explorer = DatabaseExplorer(db_connection)
    db_schema = explorer.get_owner_schema(db_config["owner"])

    all_tables = list(db_schema.keys())

    if db_config["model"] in [ORACLE11, ORACLE]:
        # In the case of ORACLE, the table name "patients"
        # was turned into "PATIENTS"
        test_tables = ["PATIENTS", "UPPERCASE", "CaseSensitive"]
    else:
        test_tables = ["patients", "UPPERCASE", "CaseSensitive"]

    for table in test_tables:
        assert table in all_tables

    for table in test_tables:
        exploration = explorer.explore(owner=db_config["owner"], table_name=table, limit=2)

        TestCase().assertCountEqual(exploration["fields"], db_schema[table])
        assert len(exploration["rows"]) == 2
        for row in exploration["rows"]:
            assert row
