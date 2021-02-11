from rest_framework import serializers


class CredentialsSerializer(serializers.Serializer):
    model = serializers.CharField()
    host = serializers.CharField()
    port = serializers.IntegerField()
    database = serializers.CharField()
    login = serializers.CharField()
    password = serializers.CharField()
    owner = serializers.CharField()
