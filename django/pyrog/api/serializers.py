from rest_framework import serializers

from common.database_connection.db_connection import DBConnection
from pagai.database_explorer.database_explorer import DatabaseExplorer
from pyrog import models


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Source
        fields = "__all__"


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Resource
        fields = "__all__"


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Owner
        fields = "__all__"

    def update(self, instance, validated_data):
        if not instance.schema:
            db_connection = DBConnection(validated_data)
            explorer = DatabaseExplorer(db_connection)
            instance.schema = explorer.get_owner_schema(instance.name)
        return super(OwnerSerializer, self).update(instance, validated_data)


class CredentialSerializer(serializers.ModelSerializer):
    owners = OwnerSerializer(many=True)

    class Meta:
        model = models.Credential
        fields = "__all__"

    def create(self, validated_data):
        db_connection = DBConnection(validated_data)
        explorer = DatabaseExplorer(db_connection)
        owners = explorer.get_owners()
        credential = models.Credential.objects.create(**validated_data)
        for owner in owners:
            models.Owner.objects.create(credential=credential, name=owner)
        return credential


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
