from inspect import getdoc, getmembers, isfunction, ismodule

from rest_framework import filters, generics, pagination, response, status, viewsets
from rest_framework.decorators import action

import scripts
from river import models
from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.topics import KafkaTopics
from river.api import serializers
from river.services import abort, batch, preview
from utils.caching import RedisCacheBackend


class BatchViewSet(viewsets.ModelViewSet):
    queryset = models.Batch.objects.all()
    serializer_class = serializers.BatchSerializer
    pagination_class = pagination.LimitOffsetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]

    def create(self, request):
        serializer = serializers.BatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        mappings = data["mappings"]

        topics, event_publisher, cache = (KafkaTopics(), KafkaEventPublisher(), RedisCacheBackend())
        batch_instance = batch(mappings, topics, event_publisher, cache)

        serializer = serializers.BatchSerializer(batch_instance)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        batch_instance = self.get_object()

        topics = KafkaTopics()
        abort(batch_instance, topics)

        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["post"], detail=True)
    def retry(self, request, *args, **kwargs):
        raise NotImplementedError


class PreviewEndpoint(generics.CreateAPIView):
    def create(self, request):
        serializer = serializers.PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        mapping = data["mapping"]
        primary_key_values = data["primary_key_values"]

        documents, errors = preview(mapping, primary_key_values)

        return response.Response({"instances": documents, "errors": errors}, status=status.HTTP_200_OK)


class ScriptsEndpoint(generics.ListAPIView):
    def list(self, request):
        res = []
        for module_name, module in getmembers(scripts, ismodule):
            for script_name, script in getmembers(module, isfunction):
                doc = getdoc(script)
                res.append({"name": script_name, "description": doc, "category": module_name})
        return response.Response(res, status=status.HTTP_200_OK)
