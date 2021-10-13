from rest_framework import serializers


class CredentialsSerializer(serializers.Serializer):
    model = serializers.CharField()
    host = serializers.CharField()
    port = serializers.IntegerField()
    database = serializers.CharField()
    login = serializers.CharField()
    password = serializers.CharField()


class ExplorationRequestSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    owner = serializers.CharField()
    table = serializers.CharField()


class ExplorationResponseSerializer(serializers.Serializer):
    fields = serializers.ListField(child=serializers.CharField())
    rows = serializers.ListField(child=serializers.ListField())
