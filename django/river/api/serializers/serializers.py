import dataclasses
from typing import Dict, List, Tuple

from rest_framework import serializers

from pyrog import models as pyrog_models
from river import models
from river.adapters.progression_counter import RedisProgressionCounter


class ErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Error
        fields = "__all__"


class ResourceForProgressionSerializer(serializers.ModelSerializer):
    class Meta:
        model = pyrog_models.Resource
        fields = ["id", "definition_id", "label"]


class ProgressionSerializer(serializers.ModelSerializer):
    resource = ResourceForProgressionSerializer(read_only=True)

    class Meta:
        model = models.Progression
        fields = ["resource", "extracted", "loaded", "failed"]


class BatchSerializer(serializers.ModelSerializer):
    # FIXME errors is a property of BaseSerializer, we shouldn't override it
    errors = ErrorSerializer(many=True, read_only=True)
    progressions = ProgressionSerializer(many=True, read_only=True)

    class Meta:
        model = models.Batch
        exclude = ["mappings"]
        extra_kwargs = {
            "resources": {"required": True},
            "canceled_at": {"allow_null": True},
            "completed_at": {"allow_null": True},
        }

    def get_progressions(self, obj) -> List[Tuple[str, Dict]]:
        """
        Fetch the number of extracted and loaded resources from redis.
        Returns a list of lists that looks like:
        [
            ["Patient", {"extracted": 100, "loaded": 20, "failed": 3}],
            ["Practitioner (nurse)", {"extracted": 200, "loaded": 10, "failed": None}],
        ]
        """
        counter = RedisProgressionCounter()

        def resource_name_with_label(resource):
            return f"{resource.definition_id}{f' ({resource.label})' if resource.label else ''}"

        # If batch is over, the counter won't necessarily be in redis
        if models.Progression.objects.filter(batch=obj):
            return [
                (
                    resource_name_with_label(progression.resource),
                    {"extracted": progression.extracted, "loaded": progression.loaded, "failed": progression.failed},
                )
                for progression in models.Progression.objects.filter(batch=obj)
            ]

        progressions = [
            [
                resource_name_with_label(resource),
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
