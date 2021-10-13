import uuid

from django.conf import settings
from django.db import models

from cuid import cuid


class Project(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    name = models.TextField(unique=True)
    version = models.TextField(blank=True, default="")
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="projects", through="ProjectUser")

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProjectUser(models.Model):
    class Meta:
        unique_together = (("user", "project"),)

    class ProjectRole(models.TextChoices):
        WRITER = "WRITER"
        READER = "READER"

    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="user_projects", on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name="source_users", on_delete=models.CASCADE)
    role = models.TextField(choices=ProjectRole.choices, default=ProjectRole.READER)


class Resource(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    project = models.ForeignKey(Project, related_name="resources", on_delete=models.CASCADE)
    label = models.TextField(blank=True, default="")
    primary_key_table = models.TextField()
    primary_key_column = models.TextField()
    definition_id = models.TextField()
    definition = models.JSONField()
    logical_reference = models.UUIDField(default=uuid.uuid4, editable=False)
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
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
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


class Comment(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    content = models.TextField()
    validated = models.BooleanField(default=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="comments", on_delete=models.CASCADE)
    attribute = models.ForeignKey(Attribute, related_name="comments", on_delete=models.CASCADE)

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

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class StaticInput(Input):
    input_group = models.ForeignKey(InputGroup, related_name="static_inputs", on_delete=models.CASCADE)
    value = models.TextField(blank=True, null=True, default=None)


class SQLInput(Input):
    input_group = models.ForeignKey(
        InputGroup, blank=True, null=True, related_name="sql_inputs", on_delete=models.CASCADE
    )
    column = models.OneToOneField("Column", related_name="sql_input", on_delete=models.CASCADE)
    script = models.TextField(blank=True, default="")
    concept_map_id = models.TextField(blank=True, default="")


class Column(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    table = models.TextField()
    column = models.TextField()
    owner = models.ForeignKey("Owner", related_name="columns", on_delete=models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Join(models.Model):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    sql_input = models.ForeignKey(SQLInput, related_name="joins", on_delete=models.CASCADE)
    left = models.ForeignKey(Column, related_name="joined_left", on_delete=models.CASCADE)
    right = models.ForeignKey(Column, related_name="joined_right", on_delete=models.CASCADE)

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
    sql_input = models.OneToOneField(SQLInput, on_delete=models.CASCADE)
    value = models.TextField(blank=True, default="")
    input_group = models.ForeignKey(InputGroup, related_name="conditions", on_delete=models.CASCADE)
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
    sql_input = models.OneToOneField(SQLInput, on_delete=models.CASCADE)


class Owner(models.Model):
    class Meta:
        unique_together = (("name", "credential"),)

    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    name = models.TextField()
    schema = models.JSONField(blank=True, null=True)
    credential = models.ForeignKey(Credential, related_name="owners", on_delete=models.CASCADE)
