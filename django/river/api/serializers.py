from rest_framework import serializers

from river import models


class ResourceSerializer(serializers.Serializer):
    resource_id = serializers.CharField()


class ErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Error
        fields = "__all__"


class BatchSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, write_only=True)  # Could be a simple list
    errors = ErrorSerializer(many=True, read_only=True)

    class Meta:
        model = models.Batch
        fields = "__all__"
