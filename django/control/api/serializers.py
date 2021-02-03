from rest_framework import serializers


class PreviewSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.JSONField())
