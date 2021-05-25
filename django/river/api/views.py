from rest_framework import viewsets

from river import models
from river.api import serializers


class BatchViewSet(viewsets.ModelViewSet):
    queryset = models.Batch.objects.all()
    serializer_class = serializers.BatchSerializer
