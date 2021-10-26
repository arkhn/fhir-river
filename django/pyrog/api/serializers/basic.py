from typing import List

from rest_framework import serializers, status

from common.adapters.fhir_api import fhir_api
from pagai.database_explorer.database_explorer import DatabaseExplorer
from pagai.errors import ExplorationError
from pyrog import models
from river.common.database_connection.db_connection import DBConnection


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
        """
        Introspects the database schema and returns the list of available owners
        Returns an empty list if a connection parameter is empty.
        """
        if "" in [obj.login, obj.password, obj.host, obj.port, obj.database]:
            return []
        try:
            db_connection = DBConnection(obj.__dict__)
            explorer = DatabaseExplorer(db_connection)
            owners = explorer.get_owners()
        except Exception as e:
            raise serializers.ValidationError(e)
        return owners

    def validate(self, data):
        credential = {**self.instance.__dict__, **data} if self.instance else data
        try:
            db_connection = DBConnection(credential).engine.connect()
            db_connection.close()
        except Exception as e:
            raise serializers.ValidationError(e)
        return super().validate(data)


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Owner
        fields = "__all__"
        read_only_fields = ["schema"]

    def validate(self, data):
        credential_instance = data["credential"] if "credential" in data else self.instance.credential
        credential = CredentialSerializer(credential_instance).data
        try:
            db_connection = DBConnection(credential)
            explorer = DatabaseExplorer(db_connection)
            name = data["name"] if "name" in data else self.instance.name
            data["schema"] = explorer.get_owner_schema(name)
        except ExplorationError as e:
            raise serializers.ValidationError({"name": [str(e)]})
        except Exception as e:
            raise serializers.ValidationError(e)
        return super().validate(data)


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Resource
        fields = "__all__"
        read_only_fields = ["definition"]

    def validate(self, data):
        """called on resource creation.
        We fetch the StructureDefinition from fhir-api before
        validating and saving the resource to the database.

        Args:
            data ([dict]): the resource instance

        Raises:
            serializers.ValidationError: if the StructureDeifnition cannot be fetched

        Returns:
            [dict]: the instance
        """
        if "definition_id" not in data:
            return super().validate(data)
        request = self.context.get("request")
        auth_token = request.session.get("oidc_access_token") if request else None
        try:
            data["definition"] = fhir_api.retrieve("StructureDefinition", data["definition_id"], auth_token)
        except Exception as e:
            raise serializers.ValidationError({"definition": [str(e)]}, code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return super().validate(data)

    def to_representation(self, instance):
        """called on resource retrieval
        If the StructureDefinition is not filled in the resource instance
        we fetch it from fhir-api and update the databse object.

        Args:
            instance ([dict]): the resource instance

        Returns:
            [OrderedDict]: the serialized resource
        """
        if not instance.definition:
            request = self.context.get("request")
            auth_token = request.session.get("oidc_access_token") if request else None
            try:
                instance.definition = fhir_api.retrieve("StructureDefinition", instance.definition_id, auth_token)
                instance.save()
            except Exception as e:
                raise serializers.ValidationError({"definition": [str(e)]}, code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return super().to_representation(instance)


class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Attribute
        fields = "__all__"


class InputGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InputGroup
        fields = "__all__"


class StaticInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StaticInput
        fields = "__all__"


class SQLInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SQLInput
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
        extra_kwargs = {"relation": {"required": True}}


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Filter
        fields = "__all__"
