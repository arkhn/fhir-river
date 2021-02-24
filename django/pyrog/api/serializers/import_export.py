"""Serializer for the full mapping.

These serializers add their child nested representations. Parent relation will be
deduced from the hierarchy. Some relations (to owners and columns) use an exported
primary key to make reference from other branch in the hierarchy.

    Usage example:

    from pyrog.api.serializers.import_export import SourceSerializer
"""

from typing import Mapping

from rest_framework import serializers

from pyrog.models import (
    Attribute,
    Column,
    Condition,
    Credential,
    Filter,
    Input,
    InputGroup,
    Join,
    Owner,
    Resource,
    Source,
)


class _ColumnField(serializers.PrimaryKeyRelatedField):
    queryset = Column.objects.all()

    def to_internal_value(self, data):
        """Find the actual representation in the submitted data, or raise."""

        for owner in self.root.initial_data["credential"]["owners"]:
            for column in owner["columns"]:
                if column["id"] == data:
                    return data
        raise serializers.ValidationError("No associated Column.")


class _OwnerField(serializers.PrimaryKeyRelatedField):
    queryset = Owner.objects.all()

    def to_internal_value(self, data):
        """Find the actual representation in the submitted data, or raise."""

        for owner in self.root.initial_data["credential"]["owners"]:
            if owner["id"] == data:
                return data
        raise serializers.ValidationError("No associated Owner.")


class _JoinSerializer(serializers.ModelSerializer):
    columns = _ColumnField(many=True)

    class Meta:
        model = Join
        fields = ["columns"]


class _ColumnSerializer(serializers.ModelSerializer):
    joins = _JoinSerializer(many=True, required=False, default=[])

    class Meta:
        model = Column
        fields = ["id", "table", "column", "joins"]
        extra_kwargs = {"id": {"read_only": False}}  # Put `id` in validated data


class _OwnerSerializer(serializers.ModelSerializer):
    columns = _ColumnSerializer(many=True, required=False, default=[])

    class Meta:
        model = Owner
        fields = ["id", "name", "schema", "columns"]
        extra_kwargs = {"id": {"read_only": False}}  # Put `id` in validated data


class _CredentialSerializer(serializers.ModelSerializer):
    owners = _OwnerSerializer(many=True, required=False, default=[])

    class Meta:
        model = Credential
        fields = ["host", "port", "database", "model", "owners"]


class _InputSerializer(serializers.ModelSerializer):
    column = _ColumnField(allow_null=True)

    class Meta:
        model = Input
        fields = ["script", "concept_map_id", "static_value", "column"]


class _ConditionSerializer(serializers.ModelSerializer):
    column = _ColumnField()

    class Meta:
        model = Condition
        fields = [
            "action",
            "column",
            "value",
            "relation",
        ]


class _InputGroupSerializer(serializers.ModelSerializer):
    inputs = _InputSerializer(many=True, required=False, default=[])
    conditions = _ConditionSerializer(many=True, required=False, default=[])

    class Meta:
        model = InputGroup
        fields = ["merging_script", "inputs", "conditions"]


class _AttributeSerializer(serializers.ModelSerializer):
    input_groups = _InputGroupSerializer(many=True, required=False, default=[])

    class Meta:
        model = Attribute
        fields = ["path", "slice_name", "definition_id", "input_groups"]


class _FilterSerializer(serializers.ModelSerializer):
    sql_column = _ColumnField()

    class Meta:
        model = Filter
        fields = ["relation", "value", "sql_column"]


class _ResourceSerializer(serializers.ModelSerializer):
    primary_key_owner = _OwnerField()
    attributes = _AttributeSerializer(many=True, required=False, default=[])
    filters = _FilterSerializer(many=True, required=False, default=[])

    class Meta:
        model = Resource
        fields = [
            "label",
            "primary_key_table",
            "primary_key_column",
            "definition_id",
            "logical_reference",
            "primary_key_owner",
            "attributes",
            "filters",
        ]


class SourceSerializer(serializers.ModelSerializer):
    resources = _ResourceSerializer(many=True, required=False, default=[])
    credential = _CredentialSerializer()

    class Meta:
        model = Source
        fields = ["name", "version", "resources", "credential"]

    def create(self, validated_data):
        """Create Source and related models from the validated representation.

        The same pattern is applied hierarchically:
            * Pop data of interest from validated data,
            * Create models,
            * Apply to child representations.

        Owners and columns are created first and kept in registries. When crossing later
        references to owner or column objects, the associated models will be found with
        those registries.
        """

        resources_data = validated_data.pop("resources")
        credential_data = validated_data.pop("credential")
        owners_data = credential_data.pop("owners")

        source = Source.objects.create(**validated_data)
        credential = Credential.objects.create(source=source, **credential_data)

        # Registries to track owner and column instances by their exported ids
        owner_by_id: Mapping[str, Owner] = {}
        column_by_id: Mapping[str, Column] = {}

        # First hierarchy
        for owner_data in owners_data:
            columns_data = owner_data.pop("columns")

            owner = Owner.objects.create(credential=credential, **owner_data)

            owner_by_id[owner_data["id"]] = owner

            # Intermediate list (ordered) to track Join instances
            joins = []

            for column_data in columns_data:
                joins_data = column_data.pop("joins")

                column = Column.objects.create(owner=owner, **column_data)

                column_by_id[column_data["id"]] = column

                for _ in joins_data:
                    joins.append(Join.objects.create(column=column))

                # Put back the joins data for the second pass
                column_data["joins"] = joins_data

            # Second pass to set the references to joins on columns,
            # now that all columns have been created.
            for column_data in columns_data:
                joins_data = column_data.pop("joins")
                for join_data in joins_data:
                    # Order is important
                    join = joins.pop(0)
                    for column_data in join_data["columns"]:
                        column = column_by_id[column_data]
                        column.join = join
                        column.save(update_fields=["join"])

        # Main hierarchy
        for resource_data in resources_data:
            filters_data = resource_data.pop("filters")
            attributes_data = resource_data.pop("attributes")
            owner_data = resource_data.pop("primary_key_owner")

            owner = owner_by_id[owner_data]
            resource = Resource.objects.create(primary_key_owner=owner, source=source, **resource_data)

            for filter_data in filters_data:
                column_data = filter_data.pop("sql_column")

                column = column_by_id[column_data]
                Filter.objects.create(resource=resource, sql_column=column, **filter_data)

            for attribute_data in attributes_data:
                input_groups_data = attribute_data.pop("input_groups")

                attribute = Attribute.objects.create(resource=resource, **attribute_data)

                for input_group_data in input_groups_data:
                    inputs_data = input_group_data.pop("inputs")
                    conditions_data = input_group_data.pop("conditions")

                    input_group = InputGroup.objects.create(attribute=attribute, **input_group_data)

                    for input_data in inputs_data:
                        column_data = input_data.pop("column")

                        column = column_by_id[column_data] if column_data is not None else None
                        Input.objects.create(
                            input_group=input_group,
                            column=column,
                            **input_data,
                        )

                    for condition_data in conditions_data:
                        column_data = condition_data.pop("column")

                        column = column_by_id[column_data]
                        Condition.objects.create(input_group=input_group, column=column, **condition_data)

        return source
