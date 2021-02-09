from rest_framework import serializers

from pyrog import models


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Source
        fields = "__all__"


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Resource
        fields = "__all__"
