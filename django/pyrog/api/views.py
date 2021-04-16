from rest_framework import viewsets

from django_filters import rest_framework as django_filters
from pyrog import models
from pyrog.api import filters
from pyrog.api.serializers import basic as basic_serializers
from pyrog.api.serializers.import_export import SourceSerializer


class SourceViewSet(viewsets.ModelViewSet):
    queryset = models.Source.objects.all()

    def get_serializer_class(self):
        if self.request is not None and self.request.query_params.get("full", False):
            return SourceSerializer
        return basic_serializers.SourceSerializer

    def get_queryset(self):
        """Limit visibility of sources."""
        return self.queryset.filter(users=self.request.user)

    def perform_create(self, serializer):
        """Try to assign a owner to the new source."""

        source = serializer.save()

        # To give the source a owner, the request must be authenticated
        if not self.request.user.is_anonymous:
            source.users.add(self.request.user)
            source.save()


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = models.Resource.objects.all()
    serializer_class = basic_serializers.ResourceSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.ResourceFilterSet


class CredentialViewSet(viewsets.ModelViewSet):
    queryset = models.Credential.objects.all()
    serializer_class = basic_serializers.CredentialSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ["source"]


class AttributeViewSet(viewsets.ModelViewSet):
    queryset = models.Attribute.objects.all()
    serializer_class = basic_serializers.AttributeSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.AttributeFilterSet


class InputGroupViewSet(viewsets.ModelViewSet):
    queryset = models.InputGroup.objects.all()
    serializer_class = basic_serializers.InputGroupSerializer


class InputViewSet(viewsets.ModelViewSet):
    queryset = models.Input.objects.all()
    serializer_class = basic_serializers.InputSerializer


class ColumnViewSet(viewsets.ModelViewSet):
    queryset = models.Column.objects.all()
    serializer_class = basic_serializers.ColumnSerializer


class JoinViewSet(viewsets.ModelViewSet):
    queryset = models.Join.objects.all()
    serializer_class = basic_serializers.JoinSerializer


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = models.Condition.objects.all()
    serializer_class = basic_serializers.ConditionSerializer


class FilterViewSet(viewsets.ModelViewSet):
    queryset = models.Filter.objects.all()
    serializer_class = basic_serializers.FilterSerializer


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = models.Owner.objects.all()
    serializer_class = basic_serializers.OwnerSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ["credential"]
