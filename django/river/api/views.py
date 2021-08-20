from rest_framework import filters, generics, pagination, response, status, viewsets
from rest_framework.decorators import action

from common.scripts import ScriptsRepository
from drf_spectacular.utils import extend_schema
from pyrog import models as pyrog_models
from pyrog.api.serializers.import_export import MappingSerializer
from river import models as river_models
from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.topics import KafkaTopicsManager
from river.api.serializers import serializers
from river.common.mapping.fetch_concept_maps import dereference_concept_map
from river.services import abort, batch, preview


class BatchViewSet(viewsets.ModelViewSet):
    queryset = river_models.Batch.objects.all()
    serializer_class = serializers.BatchSerializer
    pagination_class = pagination.LimitOffsetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        resource_ids = data.pop("resource_ids")

        # Store serialized mapping
        # FIXME we consider that all the resources come from the same Source
        resource = pyrog_models.Resource.objects.get(id=resource_ids[0])
        source = pyrog_models.Source.objects.get(id=resource.source.id)
        mappings = MappingSerializer(source).data

        auth_token = self.request.session.get("oidc_access_token")
        for mapping in mappings["resources"]:
            dereference_concept_map(mapping, auth_token)

        serializer.validated_data["mappings"] = mappings

        batch_instance = serializer.save()

        topics_manager = KafkaTopicsManager()
        event_publisher = KafkaEventPublisher()

        batch(batch_instance.id, resource_ids, topics_manager, event_publisher)

        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        batch_instance = self.get_object()

        topics_manager = KafkaTopicsManager()
        abort(batch_instance, topics_manager)

        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["post"], detail=True)
    def retry(self, request, *args, **kwargs):
        raise NotImplementedError


@extend_schema(request=serializers.PreviewRequestSerializer, responses={"200": serializers.PreviewResponseSerializer})
class PreviewEndpoint(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        serializer = serializers.PreviewRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        resource_id = data["resource_id"]

        # FIXME we consider that all the resources come from the same Source
        resource = pyrog_models.Resource.objects.get(id=resource_id)
        source = pyrog_models.Source.objects.get(id=resource.source.id)
        mappings = MappingSerializer(source).data

        auth_token = self.request.session.get("oidc_access_token")
        for mapping in mappings["resources"]:
            dereference_concept_map(mapping, auth_token)

        primary_key_values = data["primary_key_values"]

        documents, errors = preview(mappings, primary_key_values)

        return response.Response({"instances": documents, "errors": errors}, status=status.HTTP_200_OK)


class ScriptsEndpoint(generics.ListAPIView):
    serializer_class = serializers.ScriptsSerializer
    scripts_repo = ScriptsRepository()

    def list(self, request, *args, **kwargs):
        res = [
            {"name": script.name, "description": script.description, "category": script.category}
            for script in self.scripts_repo.scripts.values()
        ]
        return response.Response(res, status=status.HTTP_200_OK)
