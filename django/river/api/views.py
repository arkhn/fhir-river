from rest_framework import filters, generics, pagination, response, status, viewsets
from rest_framework.decorators import action

from common.scripts import ScriptsRepository
from river import models
from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.pyrog_client import APIPyrogClient
from river.adapters.topics import KafkaTopicsManager
from river.api import serializers
from river.services import abort, batch, preview


class BatchViewSet(viewsets.ModelViewSet):
    queryset = models.Batch.objects.all()
    serializer_class = serializers.BatchSerializer
    pagination_class = pagination.LimitOffsetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        batch_instance = serializer.save()

        topics_manager = KafkaTopicsManager()
        event_publisher = KafkaEventPublisher()

        data = serializer.validated_data
        resources = data["mappings"]["resources"]

        batch(batch_instance.id, resources, topics_manager, event_publisher)

        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        batch_instance = self.get_object()

        topics_manager = KafkaTopicsManager()
        abort(batch_instance, topics_manager)

        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["post"], detail=True)
    def retry(self, request, *args, **kwargs):
        raise NotImplementedError


class PreviewEndpoint(generics.CreateAPIView):
    serializer_class = serializers.PreviewSerializer

    def create(self, request, *args, **kwargs):
        serializer = serializers.PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        headers = self.get_success_headers(serializer.data)

        data = serializer.validated_data
        resource_id = data["resource_id"]
        primary_key_values = data["primary_key_values"]
        authorization_header = request.META.get("HTTP_AUTHORIZATION")

        pyrog_client = APIPyrogClient(authorization_header)

        documents, errors = preview(resource_id, primary_key_values, pyrog_client)

        return response.Response(
            {"instances": documents, "errors": errors}, status=status.HTTP_201_CREATED, headers=headers
        )


class ScriptsEndpoint(generics.ListAPIView):
    serializer_class = serializers.ScriptsSerializer
    scripts_repo = ScriptsRepository()

    def list(self, request, *args, **kwargs):
        res = [
            {"name": script.name, "description": script.description, "category": script.category}
            for script in self.scripts_repo.scripts.values()
        ]
        return response.Response(res, status=status.HTTP_200_OK)
