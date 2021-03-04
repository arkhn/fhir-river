from rest_framework import serializers

from common.database_connection.db_connection import DBConnection
from pagai.database_explorer.database_explorer import DatabaseExplorer
from pyrog import models


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Owner
        fields = "__all__"
        extra_kwargs = {
            "schema": {
                "required": False,
                "read_only": True,
            },
        }

    def update(self, instance, validated_data):
        if not instance.schema:
            credential = CredentialSerializer(validated_data["credential"]).data
            try:
                db_connection = DBConnection(credential)
                explorer = DatabaseExplorer(db_connection)
                validated_data["schema"] = explorer.get_owner_schema(instance.name)
            except Exception as e:
                raise serializers.ValidationError(detail=e)
        return super(OwnerSerializer, self).update(instance, validated_data)


class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Credential
        fields = "__all__"
        extra_kwargs = {
            "source": {
                "required": False,
                "read_only": True,
            },
        }


class SourceSerializer(serializers.ModelSerializer):
    credential = CredentialSerializer()

    class Meta:
        model = models.Source
        fields = ["name", "version", "credential"]

    def create(self, validated_data):
        try:
            db_connection = DBConnection(validated_data["credential"])
            explorer = DatabaseExplorer(db_connection)
            owners = explorer.get_owners()
        except Exception as e:
            raise serializers.ValidationError(detail=e)
        source = models.Source.objects.create(name=validated_data["name"], version=validated_data.get("version"))
        credential = models.Credential.objects.create(source=source, **validated_data["credential"])
        for owner in owners:
            models.Owner.objects.create(credential=credential, name=owner)
        return source


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
