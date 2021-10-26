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
    -- pyrog."Owner".schema is a JSON-escaped string such as "{\"admissions\": [\"admittime\"]}"
    -- therefore we need to un-escape it using the #>> jsonb operator
    "schema" #>> '{}',
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
    pyrog."Resource"
WHERE
    "primaryKeyOwner" IS NOT NULL;

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
    pyrog."Attribute"
WHERE
    "resource" IS NOT NULL
    AND "resource" IN (
        SELECT
            id
        FROM
            pyrog_resource
    );

INSERT INTO
    pyrog_inputgroup
SELECT
    "id",
    COALESCE("mergingScript", ''),
    "updatedAt",
    "createdAt",
    "attributeId"
FROM
    pyrog."InputGroup"
WHERE
    "attributeId" IS NOT NULL
    AND "attributeId" IN (
        SELECT
            id
        FROM
            pyrog_attribute
    );

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
    pyrog."Input"
WHERE
    "inputGroupId" IS NOT NULL
    AND "inputGroupId" IN (
        SELECT
            id
        FROM
            pyrog_inputgroup
    );

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
    pyrog."Column"
WHERE
    "owner" IS NOT NULL
    AND "owner" IN (
        SELECT
            id
        FROM
            pyrog_owner
    )
    and (
        ("input" is not null AND "input" IN ( SELECT id from pyrog_input))
        or
        ("join" is not null)
    );

INSERT INTO
    pyrog_join
SELECT
    "id",
    "updatedAt",
    "createdAt",
    "column"
FROM
    pyrog."Join"
WHERE
    "column" IS NOT NULL
    AND "column" IN (
        SELECT
            id
        FROM
            pyrog_column
    );

DELETE FROM
    pyrog_column
WHERE
    "join_id" IS NOT NULL
    AND "join_id" NOT IN (
        SELECT
            id
        FROM
            pyrog_join
    );

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
    AND "action" IS NOT NULL
    AND "column" IN (
        SELECT
            id
        FROM
            pyrog_column
    );

INSERT INTO
    pyrog_filter
SELECT
    "id",
    "relation",
    "value",
    "resource",
    "sqlColumn"
FROM
    pyrog."Filter"
WHERE
    "resource" IS NOT NULL
    AND "resource" IN (
        SELECT
            id
        FROM
            pyrog_resource
    )
    AND "sqlColumn" IN (
        SELECT
            id
        FROM
            pyrog_column
    );

INSERT INTO
    users_user
SELECT
    '',
    null,
    FALSE,
    '',
    '',
    CASE
        WHEN "role" = 'ADMIN' THEN TRUE
        ELSE FALSE
    END,
    TRUE,
    "createdAt",
    "id",
    "email",
    "name"
FROM
    pyrog."User";

INSERT INTO
    pyrog_sourceuser
SELECT
    "id",
    "role",
    "source",
    "user"
FROM
    pyrog."AccessControl";

INSERT INTO
    pyrog_comment
SELECT
    "id",
    "content",
    "validation",
    "updatedAt",
    "createdAt",
    "attribute",
    "author"
FROM
    pyrog."Comment"
WHERE
    "attribute" is NOT NULL
        AND "attribute" IN (
        SELECT
            id
        FROM
            pyrog_attribute
    );

COMMIT;