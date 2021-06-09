from rest_framework import serializers


class ResourceSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    resource_type = serializers.CharField()


class CreateBatchSerializer(serializers.Serializer):
    resources = serializers.ListField(child=ResourceSerializer())


class CreateRecurringBatchSerializer(serializers.Serializer):
    resources = serializers.ListField(child=ResourceSerializer())
    schedule_interval = serializers.CharField()


class PreviewSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.JSONField())
