import json
import logging
from glob import glob

from django.core.management.base import BaseCommand

from pyrog.api.serializers.import_export import MappingSerializer

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        # TODO doc
        parser.add_argument("--mappings", required=True)

    def handle(self, *args, **options):
        for mapping in glob(options.get("mappings")):
            print(f"Importing {mapping}...")
            with open(mapping, "r") as f:
                serializer = MappingSerializer(data=json.load(f))
                if not serializer.is_valid():
                    # TODO clean exit
                    print(serializer.errors)
                    raise Exception
                serializer.save()
