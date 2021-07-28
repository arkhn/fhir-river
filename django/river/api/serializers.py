from rest_framework import serializers

from pyrog.api.serializers.import_export import MappingSerializer
from river import models


class ErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Error
        fields = "__all__"


class BatchSerializer(serializers.ModelSerializer):
    errors = ErrorSerializer(many=True, read_only=True)

    class Meta:
        model = models.Batch
        fields = "__all__"


class PreviewRequestSerializer(serializers.Serializer):
    mapping = MappingSerializer()
    primary_key_values = serializers.ListField(child=serializers.CharField())


class PreviewResponseSerializer(serializers.Serializer):
    instances = serializers.ListField(child=serializers.JSONField())
    errors = serializers.ListField(child=serializers.CharField())


class ScriptsSerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    category = serializers.CharField()
