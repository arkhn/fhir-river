import logging

from django.core.management.base import BaseCommand

from pyrog import models
from pyrog.api.serializers import basic as serializers

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Django command to update path of old-pyrog attributes
    adding resource type as prefix
    """

    def handle(self, *args, **options):
        resources = models.Resource.objects.all()
        for resource in resources:
            serialized_resource = serializers.ResourceSerializer(resource).data
            resource_type = serialized_resource["definition"]["type"]
            attributes = models.Attribute.objects.filter(resource=resource.id)
            for attribute in attributes:
                if not attribute.path.startswith(resource_type):
                    attribute.path = f"{resource_type}.{attribute.path}"
                    attribute.save()
