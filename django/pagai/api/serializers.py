from rest_framework import serializers


class CredentialsSerializer(serializers.Serializer):
    model = serializers.CharField()
    host = serializers.CharField()
    port = serializers.IntegerField()
    database = serializers.CharField()
    login = serializers.CharField()
    password = serializers.CharField()


class ExplorationSerializer(serializers.Serializer):
    fields = serializers.ListField(child=serializers.CharField())
    rows = serializers.ListField(child=serializers.ListField(child=serializers.CharField()))
