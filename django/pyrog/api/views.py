from rest_framework import viewsets

from django_filters import rest_framework as django_filters
from pyrog import models
from pyrog.api import filters
from pyrog.api.serializers import resources as resources_serializers
from pyrog.api.serializers.import_export import SourceSerializer


class SourceViewSet(viewsets.ModelViewSet):
    queryset = models.Source.objects.all()

    def get_serializer_class(self):
        if self.request.query_params.get("full", False):
            return SourceSerializer
        return resources_serializers.SourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = models.Resource.objects.all()
    serializer_class = resources_serializers.ResourceSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.ResourceFilterSet


class CredentialViewSet(viewsets.ModelViewSet):
    queryset = models.Credential.objects.all()
    serializer_class = resources_serializers.CredentialSerializer


class AttributeViewSet(viewsets.ModelViewSet):
    queryset = models.Attribute.objects.all()
    serializer_class = resources_serializers.AttributeSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.AttributeFilterSet


class InputGroupViewSet(viewsets.ModelViewSet):
    queryset = models.InputGroup.objects.all()
    serializer_class = resources_serializers.InputGroupSerializer


class InputViewSet(viewsets.ModelViewSet):
    queryset = models.Input.objects.all()
    serializer_class = resources_serializers.InputSerializer


class ColumnViewSet(viewsets.ModelViewSet):
    queryset = models.Column.objects.all()
    serializer_class = resources_serializers.ColumnSerializer


class JoinViewSet(viewsets.ModelViewSet):
    queryset = models.Join.objects.all()
    serializer_class = resources_serializers.JoinSerializer


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = models.Condition.objects.all()
    serializer_class = resources_serializers.ConditionSerializer


class FilterViewSet(viewsets.ModelViewSet):
    queryset = models.Filter.objects.all()
    serializer_class = resources_serializers.FilterSerializer


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = models.Owner.objects.all()
    serializer_class = resources_serializers.OwnerSerializer
