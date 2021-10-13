from rest_framework import filters as drf_filters
from rest_framework import viewsets
from rest_framework.decorators import action

from django.conf import settings

from django_filters import rest_framework as django_filters
from pyrog import models
from pyrog.api import filters
from pyrog.api.serializers import basic as basic_serializers
from pyrog.api.serializers.mapping import MappingSerializer, MappingWithPartialCredentialSerializer
from revproxy.views import ProxyView


class FhirProxyView(ProxyView):
    upstream = settings.FHIR_API_URL

    def get_request_headers(self):
        headers = super().get_request_headers()
        headers["Cache-Control"] = "no-cache"
        try:
            token = self.request.session["oidc_access_token"]
            headers["Authorization"] = f"Bearer {token}"
        except KeyError:
            pass
        return headers


class SourceViewSet(viewsets.ModelViewSet):
    queryset = models.Project.objects.all()
    serializer_class = basic_serializers.SourceSerializer
    filter_backends = [drf_filters.OrderingFilter]
    ordering_fields = ["created_at"]
    ordering = ["created_at"]

    @action(detail=False, methods=["post"], serializer_class=MappingSerializer, url_path="import")
    def import_mapping(self, request):
        return self.create(request)

    @action(detail=True, methods=["get"], serializer_class=MappingWithPartialCredentialSerializer, url_path="export")
    def export_mapping(self, request, pk=None):
        return self.retrieve(request)

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
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.ResourceFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class CredentialViewSet(viewsets.ModelViewSet):
    queryset = models.Credential.objects.all()
    serializer_class = basic_serializers.CredentialSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.CredentialFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class AttributeViewSet(viewsets.ModelViewSet):
    queryset = models.Attribute.objects.all()
    serializer_class = basic_serializers.AttributeSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.AttributeFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class InputGroupViewSet(viewsets.ModelViewSet):
    queryset = models.InputGroup.objects.all()
    serializer_class = basic_serializers.InputGroupSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.InputGroupFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class StaticInputViewSet(viewsets.ModelViewSet):
    queryset = models.StaticInput.objects.all()
    serializer_class = basic_serializers.StaticInputSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.StaticInputFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class SQLInputViewSet(viewsets.ModelViewSet):
    queryset = models.SQLInput.objects.all()
    serializer_class = basic_serializers.SQLInputSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.SQLInputFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class ColumnViewSet(viewsets.ModelViewSet):
    queryset = models.Column.objects.all()
    serializer_class = basic_serializers.ColumnSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.ColumnFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class JoinViewSet(viewsets.ModelViewSet):
    queryset = models.Join.objects.all()
    serializer_class = basic_serializers.JoinSerializer
    filter_backends = [django_filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = filters.JoinFilterSet
    ordering_fields = ["created_at"]
    ordering = ["created_at"]


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = models.Condition.objects.all()
    serializer_class = basic_serializers.ConditionSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.ConditionFilterSet


class FilterViewSet(viewsets.ModelViewSet):
    queryset = models.Filter.objects.all()
    serializer_class = basic_serializers.FilterSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.FilterFilterSet


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = models.Owner.objects.all()
    serializer_class = basic_serializers.OwnerSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = filters.OwnerFilterSet
