"""Serializer for the full mapping."""

from rest_framework import serializers

from pyrog.models import Condition, Credential, Filter


class MappingJoinSerializer(serializers.Serializer):
    columns = serializers.ListField(child=serializers.CharField())


class MappingColumnSerializer(serializers.Serializer):
    id = serializers.CharField()
    table = serializers.CharField()
    column = serializers.CharField()
    joins = MappingJoinSerializer(many=True, required=False, default=[])


class MappingOwnerSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    schema = serializers.JSONField(allow_null=True, required=False)
    columns = MappingColumnSerializer(many=True, required=False, default=[])


class MappingCredentialSerializer(serializers.Serializer):
    host = serializers.CharField()
    port = serializers.IntegerField()
    database = serializers.CharField()
    model = serializers.ChoiceField(choices=Credential.Dialect.choices)
    owners = MappingOwnerSerializer(many=True, required=False, default=[])
    login = serializers.CharField()
    password = serializers.CharField()


class MappingInputSerializer(serializers.Serializer):
    script = serializers.CharField(allow_blank=True, required=False)
    concept_map_id = serializers.CharField(allow_blank=True, required=False)
    concept_map = serializers.JSONField(required=False)
    static_value = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    column = serializers.CharField(allow_null=True)


class MappingConditionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=Condition.Action.choices)
    column = serializers.CharField()
    value = serializers.CharField(allow_blank=True, required=False)
    relation = serializers.ChoiceField(choices=Condition.Relation.choices, required=False)


class MappingInputGroupSerializer(serializers.Serializer):
    id = serializers.CharField()
    merging_script = serializers.CharField(allow_blank=True, required=False)
    inputs = MappingInputSerializer(many=True, required=False, default=[])
    conditions = MappingConditionSerializer(many=True, required=False, default=[])


class MappingAttributeSerializer(serializers.Serializer):
    path = serializers.CharField()
    slice_name = serializers.CharField(allow_blank=True, required=False)
    definition_id = serializers.CharField()
    input_groups = MappingInputGroupSerializer(many=True, required=False, default=[])


class MappingFilterSerializer(serializers.Serializer):
    relation = serializers.ChoiceField(choices=Filter.Relation.choices)
    value = serializers.CharField(allow_blank=True, required=False)
    sql_column = serializers.CharField()


class MappingResourceSerializer(serializers.Serializer):
    id = serializers.CharField()
    label = serializers.CharField(allow_blank=True, required=False)
    primary_key_table = serializers.CharField()
    primary_key_column = serializers.CharField()
    definition_id = serializers.CharField()
    primary_key_owner = serializers.CharField()
    attributes = MappingAttributeSerializer(many=True, required=False, default=[])
    filters = MappingFilterSerializer(many=True, required=False, default=[])
    logical_reference = serializers.CharField()


class MappingUserSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    username = serializers.CharField()


class MappingSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    version = serializers.CharField(allow_blank=True, required=False)
    resources = MappingResourceSerializer(many=True, required=False, default=[])
    credential = MappingCredentialSerializer()
    users = MappingUserSerializer(many=True, required=False, default=[])

    updated_at = serializers.CharField()
    created_at = serializers.CharField()
