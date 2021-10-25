import dataclasses
from typing import List

from rest_framework import serializers

from river import models
from river.adapters.progression_counter import RedisProgressionCounter


class ErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Error
        fields = "__all__"


class BatchSerializer(serializers.ModelSerializer):
    errors = ErrorSerializer(many=True, read_only=True)
    progressions = serializers.SerializerMethodField()

    class Meta:
        model = models.Batch
        exclude = ["mappings"]
        extra_kwargs = {
            "resources": {"required": True},
            "progressions": {"read_only": True},
            "canceled_at": {"allow_null": True},
            "completed_at": {"allow_null": True},
        }

    def get_progressions(self, obj) -> List[List]:
        """
        Fetch the number of extracted and loaded resources from redis.
        Returns a list of lists that looks like:
        [
            ["Patient", {"extracted": 100, "loaded": 20, "failed": 3}],
            ["Practitioner (nurse)", {"extracted": 200, "loaded": 10, "failed": None}],
        ]
        """
        counter = RedisProgressionCounter()

        # If batch is over, the counter won't necessarily be in redis
        if obj.progressions:
            return obj.progressions

        progressions = [
            [
                f"{resource.definition_id}{f' ({resource.label})' if resource.label else ''}",
                dataclasses.asdict(counter.get(f"{obj.id}:{resource.id}")),
            ]
            for resource in obj.resources.all()
        ]

        return progressions


class PreviewRequestSerializer(serializers.Serializer):
    resource_id = serializers.CharField()
    primary_key_values = serializers.ListField(child=serializers.CharField())


class OperationOutcomeIssueSerializer(serializers.Serializer):
    severity = serializers.ChoiceField(choices=["fatal", "error", "warning", "information"])
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
