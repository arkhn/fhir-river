from rest_framework import serializers

from common.database_connection.db_connection import DBConnection
from pagai.database_explorer.database_explorer import DatabaseExplorer
from pyrog import models


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Owner
        fields = "__all__"

    def create(self, validated_data):
        credential = CredentialSerializer(validated_data["credential"]).data
        try:
            db_connection = DBConnection(credential)
            explorer = DatabaseExplorer(db_connection)
            validated_data["schema"] = explorer.get_owner_schema(validated_data["name"])
        except Exception as e:
            raise serializers.ValidationError(e)
        return super(OwnerSerializer, self).create(validated_data)


class CredentialSerializer(serializers.ModelSerializer):
    owners = serializers.SerializerMethodField()

    class Meta:
        model = models.Credential
        fields = "__all__"

    def get_owners(self, obj):
        try:
            db_connection = DBConnection(obj)
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


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Source
        fields = "__all__"


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
