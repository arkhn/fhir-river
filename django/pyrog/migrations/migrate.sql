/* This script migrates the historical data from the prisma schema to the django schema */
BEGIN;

INSERT INTO
    pyrog_template
SELECT
    "id",
    "name",
    "updatedAt",
    "createdAt"
FROM
    pyrog."Template";

INSERT INTO
    pyrog_source
SELECT
    "id",
    "name",
    COALESCE("version", ''),
    "updatedAt",
    "createdAt",
    "template"
FROM
    pyrog."Source";

INSERT INTO
    pyrog_credential
SELECT
    "id",
    "host",
    CAST("port" AS integer),
    "database",
    "login",
    "password",
    "model",
    "updatedAt",
    "createdAt",
    "source"
FROM
    pyrog."Credential";

INSERT INTO
    pyrog_owner
SELECT
    "id",
    "name",
    "schema",
    "credential"
FROM
    pyrog."Owner";

INSERT INTO
    pyrog_resource
SELECT
    "id",
    COALESCE("label", ''),
    COALESCE("primaryKeyTable", ''),
    COALESCE("primaryKeyColumn", ''),
    "definitionId",
    "logicalReference",
    "updatedAt",
    "createdAt",
    "primaryKeyOwner",
    "source"
FROM
    pyrog."Resource";

INSERT INTO
    pyrog_attribute
SELECT
    "id",
    "path",
    COALESCE("sliceName", ''),
    "definitionId",
    "updatedAt",
    "createdAt",
    "resource"
FROM
    pyrog."Attribute";

INSERT INTO
    pyrog_inputgroup
SELECT
    "id",
    COALESCE("mergingScript", ''),
    "updatedAt",
    "createdAt",
    "attributeId"
FROM
    pyrog."InputGroup";

INSERT INTO
    pyrog_input
SELECT
    "id",
    COALESCE("script", ''),
    COALESCE("conceptMapId", ''),
    COALESCE("staticValue", ''),
    "updatedAt",
    "createdAt",
    "inputGroupId"
FROM
    pyrog."Input";

INSERT INTO
    pyrog_column
SELECT
    "id",
    COALESCE("table", ''),
    COALESCE("column", ''),
    "updatedAt",
    "createdAt",
    "input",
    "join",
    "owner"
FROM
    pyrog."Column";

INSERT INTO
    pyrog_join
SELECT
    "id",
    "updatedAt",
    "createdAt",
    "column"
FROM
    pyrog."Join";

INSERT INTO
    pyrog_condition
SELECT
    "id",
    "action",
    COALESCE("value", ''),
    "relation",
    "column",
    "inputGroup"
FROM
    pyrog."Condition"
WHERE
    "relation" IS NOT NULL
    AND "action" IS NOT NULL;

INSERT INTO
    pyrog_filter
SELECT
    "id",
    "relation",
    "value",
    "resource",
    "sqlColumn"
FROM
    pyrog."Filter";

COMMIT;