from rest_framework import viewsets

from pyrog import models
from pyrog.api import serializers


class SourceViewSet(viewsets.ModelViewSet):
    queryset = models.Source.objects.all()
    serializer_class = serializers.SourceSerializer
