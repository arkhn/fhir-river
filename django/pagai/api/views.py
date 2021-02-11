import logging

from rest_framework import status, viewsets
from rest_framework.response import Response

# from django.conf import settings

# from extractor.extract import Extractor
# from pagai.api import serializers

logger = logging.getLogger(__name__)


class OwnersViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([], status=status.HTTP_200_OK)
