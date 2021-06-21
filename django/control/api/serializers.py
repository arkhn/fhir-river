from rest_framework import serializers


class ResourceSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    resource_type = serializers.CharField()


class CreateMappingSerializer(serializers.Serializer):
    resource_ids = serializers.ListField(child=serializers.CharField())
    mapping_id = serializers.CharField()


class CreateBatchSerializer(serializers.Serializer):
    resources = serializers.ListField(child=ResourceSerializer())
    mapping_id = serializers.CharField()


class PreviewSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.JSONField())
