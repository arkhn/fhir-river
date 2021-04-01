from django.db import models

from cuid import cuid

# NOTE:
# * Some FK fields are expected to be sometimes null in the previous DB schema.
# * User, Comment and AccessControl tables will be added. The User table should be
#   implemented with respect to the framework (django).
# * Everything is now snake-cased. Other cases could be provided through serialization.


class Source(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    name = models.TextField(unique=True)
    version = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Resource(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    source = models.ForeignKey(Source, related_name="resources", on_delete=models.CASCADE)
    label = models.TextField(blank=True, default="")
    primary_key_table = models.TextField()
    primary_key_column = models.TextField()
    definition_id = models.TextField()
    logical_reference = models.TextField()
    primary_key_owner = models.ForeignKey("Owner", related_name="resources", on_delete=models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Credential(models.Model):
    class Dialect(models.TextChoices):
        MSSQL = "MSSQL"
        POSTGRESQL = "POSTGRES"
        ORACLE = "ORACLE"
        SQLLITE = "SQLLITE"

    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
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
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    path = models.TextField()
    slice_name = models.TextField(blank=True, default="")
    definition_id = models.TextField()
    resource = models.ForeignKey(Resource, related_name="attributes", on_delete=models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class InputGroup(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    merging_script = models.TextField(blank=True, default="")
    attribute = models.ForeignKey(Attribute, related_name="input_groups", on_delete=models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Input(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    input_group = models.ForeignKey(InputGroup, related_name="inputs", on_delete=models.CASCADE)
    script = models.TextField(blank=True, default="")
    concept_map_id = models.TextField(blank=True, default="")
    static_value = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Column(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    table = models.TextField()
    column = models.TextField()
    join = models.ForeignKey("Join", related_name="columns", blank=True, null=True, on_delete=models.CASCADE)
    input_ = models.OneToOneField(Input, name="input", blank=True, null=True, on_delete=models.CASCADE)
    owner = models.ForeignKey("Owner", related_name="owners", on_delete=models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Join(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    column = models.ForeignKey(Column, related_name="joins", on_delete=models.CASCADE)

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

    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    action = models.TextField(choices=Action.choices)
    column = models.OneToOneField(Column, on_delete=models.CASCADE)
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

    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    relation = models.TextField(choices=Relation.choices)
    value = models.TextField(blank=True, default="")
    resource = models.ForeignKey(Resource, related_name="filters", on_delete=models.CASCADE)
    sql_column = models.OneToOneField(Column, on_delete=models.CASCADE)


class Owner(models.Model):
    class Meta:
        unique_together = (("name", "credential"),)

    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    name = models.TextField()
    schema = models.JSONField(blank=True, null=True)
    credential = models.ForeignKey(Credential, related_name="owners", on_delete=models.CASCADE)
