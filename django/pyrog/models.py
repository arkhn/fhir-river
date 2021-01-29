from django.db import models

# NOTE:
# * Some FK fields are expected to be sometimes null in the previous DB schema.
# * User, Comment and AccessControl tables will be added. The User table should be
#   implemented with respect to the framework (django).
# * Everything is now snake-cased. Other cases could be provided through serialization.


class Template(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    name = models.TextField(unique=True)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Source(models.Model):
    class Meta:
        unique_together = (("name", "template"),)

    id_ = models.TextField(name="id", primary_key=True)
    template = models.ForeignKey(Template, related_name="sources", on_delete=models.CASCADE)
    name = models.TextField()
    version = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Resource(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    source = models.ForeignKey(Source, related_name="resources", on_delete=models.CASCADE)
    label = models.TextField(blank=True, default="")
    primary_key_table = models.TextField()  # Expected to sometimes be null in prod
    primary_key_column = models.TextField()  # Expected to sometimes be null in prod
    definition_id = models.TextField()
    logical_reference = models.TextField()
    primary_key_owner = models.ForeignKey(
        "Owner", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: Why nullable ?

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Credential(models.Model):
    class Dialect(models.TextChoices):
        MSSQL = "MSSQL"
        POSTGRESQL = "POSTGRES"
        ORACLE = "ORACLE"
        SQLLITE = "SQLLITE"

    id_ = models.TextField(name="id", primary_key=True)
    source = models.OneToOneField(Source, on_delete=models.CASCADE)
    host = models.TextField()
    port = models.IntegerField()
    database = models.TextField()
    login = models.TextField()
    password = models.TextField()
    model = models.TextField(choices=Dialect.choices)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Attribute(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    path = models.TextField()
    slice_name = models.TextField(blank=True, default="")
    definition_id = models.TextField()
    resource = models.ForeignKey(
        Resource, related_name="attributes", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: why nullable ?

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class InputGroup(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    merging_script = models.TextField(blank=True, default="")
    attribute = models.ForeignKey(
        Attribute, related_name="input_groups", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: why nullable ?

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Input(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    input_group = models.ForeignKey(
        InputGroup, related_name="inputs", null=True, on_delete=models.CASCADE
    )  # TODO: why nullable ?
    script = models.TextField(blank=True, default="")
    concept_map_id = models.TextField(blank=True, default="")
    static_value = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Column(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    table = models.TextField()  # Expected to sometimes be null in prod
    column = models.TextField()  # Expected to sometimes be null in prod
    join = models.ForeignKey(
        "Join", related_name="columns", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: Why nullable ?
    input_ = models.OneToOneField(
        Input, name="input", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: Why nullable ?
    owner = models.ForeignKey(
        "Owner", related_name="owners", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: Why nullable ?

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Join(models.Model):
    id_ = models.TextField(name="id", primary_key=True)
    column = models.ForeignKey(
        Column, related_name="joins", blank=True, null=True, on_delete=models.CASCADE
    )  # TODO: Why nullable ?

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Condition(models.Model):
    class Action(models.TextChoices):
        INCLUDE = "INCLUDE"
        EXCLUDE = "EXCLUDE"

    class Relation(models.TextChoices):
        EQUAL = "EQ"
        GREATER = "GT"
        GREATER_OR_EQUAL = "GE"
        LESSER = "LT"
        LESSER_OR_EQUAL = "LE"
        NOTNULL = "NOTNULL"
        NULL = "NULL"

    id_ = models.TextField(name="id", primary_key=True)
    action = models.TextField(choices=Action.choices)
    column = models.OneToOneField(Column, blank=True, null=True, on_delete=models.CASCADE)  # TODO: Why nullable ?
    value = models.TextField(blank=True, default="")
    input_group = models.ForeignKey(InputGroup, on_delete=models.CASCADE)
    relation = models.TextField(choices=Relation.choices, default=Relation.EQUAL)


class Filter(models.Model):
    class Relation(models.TextChoices):
        EQUAL = "="
        NOT_EQUAL = "<>"
        IN = "IN"
        GREATER = ">"
        GREATER_OR_EQUAL = ">="
        LESSER = "<"
        LESSER_OR_EQUAL = "<="

    id_ = models.TextField(name="id", primary_key=True)
    relation = models.TextField(choices=Relation.choices)
    value = models.TextField(blank=True, default="")  # TODO: Can be "" ?
    resource = models.ForeignKey(Resource, blank=True, null=True, on_delete=models.CASCADE)  # TODO: Why nullable ?
    sql_column = models.OneToOneField(Column, on_delete=models.CASCADE)


class Owner(models.Model):
    class Meta:
        unique_together = (("name", "credential"),)

    id_ = models.TextField(name="id", primary_key=True)
    name = models.TextField()
    schema = models.JSONField(blank=True, null=True)
    credential = models.ForeignKey(Credential, on_delete=models.CASCADE)
