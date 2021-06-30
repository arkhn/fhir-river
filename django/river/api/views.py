from inspect import getdoc, getmembers, isfunction, ismodule

from rest_framework import generics, response, status, viewsets
from rest_framework.decorators import action

import scripts
from river import models
from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.mappings import RedisMappingsRepository
from river.adapters.pyrog_client import APIPyrogClient
from river.adapters.topics import KafkaTopicsManager
from river.api import serializers
from river.services import abort, batch, preview


class BatchViewSet(viewsets.ModelViewSet):
    queryset = models.Batch.objects.all()
    serializer_class = serializers.BatchSerializer

    def create(self, request):
        serializer = serializers.BatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        data = serializer.validated_data
        resource_ids = data["resources"]
        authorization_header = request.META.get("HTTP_AUTHORIZATION")

        topics_manager = KafkaTopicsManager()
        event_publisher = KafkaEventPublisher()
        pyrog_client = APIPyrogClient(authorization_header)
        mappings_repo = RedisMappingsRepository()
        batch_instance = batch(resource_ids, topics_manager, event_publisher, pyrog_client, mappings_repo)

        serializer = serializers.BatchSerializer(batch_instance)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        batch_instance = self.get_object()

        topics_manager = KafkaTopicsManager()
        abort(batch_instance, topics_manager)

        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["post"], detail=True)
    def retry(self, request, *args, **kwargs):
        raise NotImplementedError


class PreviewEndpoint(generics.CreateAPIView):
    def create(self, request):
        serializer = serializers.PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        resource_id = data["resource_id"]
        primary_key_values = data["primary_key_values"]
        authorization_header = request.META.get("HTTP_AUTHORIZATION")

        pyrog_client = APIPyrogClient(authorization_header)

        documents, errors = preview(resource_id, primary_key_values, pyrog_client)

        return response.Response({"instances": documents, "errors": errors}, status=status.HTTP_200_OK)


class ScriptsEndpoint(generics.ListAPIView):
    def list(self, request):
        res = []
        for module_name, module in getmembers(scripts, ismodule):
            for script_name, script in getmembers(module, isfunction):
                doc = getdoc(script)
                res.append({"name": script_name, "description": doc, "category": module_name})
        return response.Response(res, status=status.HTTP_200_OK)
