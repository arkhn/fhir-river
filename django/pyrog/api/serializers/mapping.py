"""Serializer for the full mapping."""

from rest_framework import serializers

from pyrog.models import Condition, Credential, Filter


class _JoinSerializer(serializers.Serializer):
    columns = serializers.ListField(child=serializers.CharField())


class _ColumnSerializer(serializers.Serializer):
    id = serializers.CharField()
    table = serializers.CharField()
    column = serializers.CharField()
    joins = _JoinSerializer(many=True, required=False, default=[])


class _OwnerSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    schema = serializers.JSONField(allow_null=True)
    columns = _ColumnSerializer(many=True, required=False, default=[])


class _CredentialSerializer(serializers.Serializer):
    host = serializers.CharField()
    port = serializers.IntegerField()
    database = serializers.CharField()
    model = serializers.ChoiceField(choices=Credential.Dialect.choices)
    owners = _OwnerSerializer(many=True, required=False, default=[])
    login = serializers.CharField()
    password = serializers.CharField()


class _InputSerializer(serializers.Serializer):
    script = serializers.CharField(allow_blank=True)
    concept_map_id = serializers.CharField(allow_blank=True)
    static_value = serializers.CharField(allow_null=True, allow_blank=True)
    column = serializers.CharField(allow_null=True)


class _ConditionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=Condition.Action.choices)
    column = serializers.CharField()
    value = serializers.CharField(allow_blank=True)
    relation = serializers.ChoiceField(choices=Condition.Relation.choices)


class _InputGroupSerializer(serializers.Serializer):
    id = serializers.CharField()
    merging_script = serializers.CharField(allow_blank=True)
    inputs = _InputSerializer(many=True, required=False, default=[])
    conditions = _ConditionSerializer(many=True, required=False, default=[])


class _AttributeSerializer(serializers.Serializer):
    path = serializers.CharField()
    slice_name = serializers.CharField(allow_blank=True)
    definition_id = serializers.CharField()
    input_groups = _InputGroupSerializer(many=True, required=False, default=[])


class _FilterSerializer(serializers.Serializer):
    relation = serializers.ChoiceField(choices=Filter.Relation.choices)
    value = serializers.CharField(allow_blank=True)
    sql_column = serializers.CharField()


class _ResourceSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    label = serializers.CharField(allow_blank=True)
    primary_key_table = serializers.CharField()
    primary_key_column = serializers.CharField()
    definition_id = serializers.CharField()
    primary_key_owner = serializers.CharField()
    attributes = _AttributeSerializer(many=True, required=False, default=[])
    filters = _FilterSerializer(many=True, required=False, default=[])
    logical_reference = serializers.CharField()


class _UserSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    username = serializers.CharField()


class MappingSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    version = serializers.CharField(allow_blank=True)
    resources = _ResourceSerializer(many=True, required=False, default=[])
    credential = _CredentialSerializer()
    users = _UserSerializer(many=True, required=False, default=[])

    updated_at = serializers.DateTimeField()
    created_at = serializers.DateTimeField()
