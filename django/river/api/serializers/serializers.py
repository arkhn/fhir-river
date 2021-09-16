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
        exclude = ["mappings"]
        extra_kwargs = {
            "resources": {"required": True},
            "canceled_at": {"allow_null": True},
            "completed_at": {"allow_null": True},
        }


class PreviewRequestSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.CharField())


class OperationOutcomeIssueSerializer(serializers.Serializer):
    severity = serializers.CharField()
    code = serializers.CharField()
    diagnostics = serializers.CharField(allow_blank=True)
    location = serializers.ListField(child=serializers.CharField())
    expression = serializers.CharField(allow_blank=True)


class PreviewResponseSerializer(serializers.Serializer):
    instances = serializers.ListField(child=serializers.JSONField())
    errors = serializers.ListField(child=OperationOutcomeIssueSerializer())


class ScriptsSerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    category = serializers.CharField()
