from rest_framework import viewsets

from pyrog import models
from pyrog.api import serializers


class SourceViewSet(viewsets.ModelViewSet):
    queryset = models.Source.objects.all()
    serializer_class = serializers.SourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = models.Resource.objects.all()
    serializer_class = serializers.ResourceSerializer


class CredentialViewSet(viewsets.ModelViewSet):
    queryset = models.Credential.objects.all()
    serializer_class = serializers.CredentialSerializer


class AttributeViewSet(viewsets.ModelViewSet):
    queryset = models.Attribute.objects.all()
    serializer_class = serializers.AttributeSerializer


class InputGroupViewSet(viewsets.ModelViewSet):
    queryset = models.InputGroup.objects.all()
    serializer_class = serializers.InputGroupSerializer


class InputViewSet(viewsets.ModelViewSet):
    queryset = models.Input.objects.all()
    serializer_class = serializers.InputSerializer


class ColumnViewSet(viewsets.ModelViewSet):
    queryset = models.Column.objects.all()
    serializer_class = serializers.ColumnSerializer


class JoinViewSet(viewsets.ModelViewSet):
    queryset = models.Join.objects.all()
    serializer_class = serializers.JoinSerializer


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = models.Condition.objects.all()
    serializer_class = serializers.ConditionSerializer


class FilterViewSet(viewsets.ModelViewSet):
    queryset = models.Filter.objects.all()
    serializer_class = serializers.FilterSerializer


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = models.Owner.objects.all()
    serializer_class = serializers.OwnerSerializer
