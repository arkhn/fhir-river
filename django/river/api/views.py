from rest_framework import response, status, viewsets
from rest_framework.decorators import action

from river import models
from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.mappings import RedisMappingsRepository
from river.adapters.topics import KafkaTopics
from river.api import serializers
from river.services import abort, batch


class BatchViewSet(viewsets.ModelViewSet):
    queryset = models.Batch.objects.all()
    serializer_class = serializers.BatchSerializer

    def create(self, request):
        serializer = serializers.BatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        resource_ids = [resource_data["resource_id"] for resource_data in data["resources"]]

        topics, event_publisher, mappings_repo = KafkaTopics(), KafkaEventPublisher(), RedisMappingsRepository()
        batch_instance = batch(resource_ids, topics, event_publisher, mappings_repo)

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
