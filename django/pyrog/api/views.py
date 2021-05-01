from rest_framework import viewsets
from rest_framework.response import Response

import requests
from django_filters import rest_framework as django_filters
from drf_spectacular.utils import extend_schema
from pyrog import models
from pyrog.api import filters
from pyrog.api.serializers import basic as basic_serializers
from pyrog.api.serializers.import_export import SourceSerializer


class StructureDefinitionViewSet(viewsets.GenericViewSet):
    @extend_schema(operation_id="api_StructureDefinition_list")
    def list(self, request):
        token = request.session["oidc_access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{self.settings.FHIR_API_URL}/StructureDefinition"
        response = requests.get(f"{url}", headers=headers, params=request.query_params)
        return Response(response.json(), response.status_code)

    def retrieve(self, request, pk=None):
        token = request.session["oidc_access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{self.settings.FHIR_API_URL}/StructureDefinition/{pk}"
        response = requests.get(f"{url}", headers=headers, params=request.query_params)
        return Response(response.json(), response.status_code)

    def create(self, request):
        token = request.session["oidc_access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{self.settings.FHIR_API_URL}/StructureDefinition"
        response = requests.post(f"{url}", headers=headers, data=request.data)
        return Response(response.json(), response.status_code)


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
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ["resource"]


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = models.Owner.objects.all()
    serializer_class = basic_serializers.OwnerSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_fields = ["credential"]
