from typing import List

from rest_framework import serializers

from common.database_connection.db_connection import DBConnection
from pagai.database_explorer.database_explorer import DatabaseExplorer
from pyrog import models


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Source
        fields = "__all__"


class CredentialSerializer(serializers.ModelSerializer):
    available_owners = serializers.SerializerMethodField()

    class Meta:
        model = models.Credential
        fields = "__all__"

    def get_available_owners(self, obj) -> List[str]:
        try:
            db_connection = DBConnection(obj.__dict__)
            explorer = DatabaseExplorer(db_connection)
            owners = explorer.get_owners()
        except Exception as e:
            raise serializers.ValidationError(e)
        return owners

    def validate(self, data):
        try:
            db_connection = DBConnection(data).engine.connect()
            db_connection.close()
        except Exception as e:
            raise serializers.ValidationError(e)
        return data


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Owner
        fields = "__all__"
        read_only_fields = ["schema"]

    def create(self, validated_data):
        credential = CredentialSerializer(validated_data["credential"]).data
        try:
            db_connection = DBConnection(credential)
            explorer = DatabaseExplorer(db_connection)
            validated_data["schema"] = explorer.get_owner_schema(validated_data["name"])
        except Exception as e:
            raise serializers.ValidationError(e)
        if not validated_data["schema"]:
            raise serializers.ValidationError(
                {"name": [f"{validated_data['name']} schema is empty or does not exist"]}
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        credential_instance = validated_data["credential"] if "credential" in validated_data else instance.credential
        credential = CredentialSerializer(credential_instance).data
        try:
            db_connection = DBConnection(credential)
            explorer = DatabaseExplorer(db_connection)
            name = validated_data["name"] if "name" in validated_data else instance.name
            validated_data["schema"] = explorer.get_owner_schema(name)
        except Exception as e:
            raise serializers.ValidationError(e)
        if not validated_data["schema"]:
            raise serializers.ValidationError({"name": [f"{name} schema is empty or does not exist"]})
        return super().update(instance, validated_data)


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Resource
        fields = "__all__"


class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Attribute
        fields = "__all__"


class InputGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InputGroup
        fields = "__all__"


class InputSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Input
        fields = "__all__"


class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Column
        fields = "__all__"


class JoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Join
        fields = "__all__"


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Condition
        fields = "__all__"


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Filter
        fields = "__all__"
