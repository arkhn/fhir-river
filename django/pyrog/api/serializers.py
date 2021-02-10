from rest_framework import serializers

from pyrog import models


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Source
        fields = "__all__"


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Resource
        fields = "__all__"


class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Credential
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
