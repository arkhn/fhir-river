from rest_framework import serializers

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


class PreviewSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.JSONField())
