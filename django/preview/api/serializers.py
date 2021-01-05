from rest_framework import serializers


class PreviewSerializer(serializers.Serializer):
    preview_id = serializers.CharField()
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.JSONField())
    mapping = serializers.JSONField()
