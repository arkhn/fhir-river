import json
import logging
from glob import glob

from django.core.management import call_command
from django.core.management.base import BaseCommand

from pyrog.api.serializers.mapping import MappingSerializer

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Django command to import serialized mappings.

    For an exmaple of how to use this command to update mappings between 2 migrations,
    see https://github.com/arkhn/fhir-river/blob/main/django/pyrog/README.md.
    """

    def add_arguments(self, parser):
        # TODO doc
        parser.add_argument(
            "--mappings", required=True, help="path to the folder where the new mappings will be written"
        )

    def handle(self, *args, **options):
        call_command("migrate", "pyrog")

        for mapping in glob(options.get("mappings")):
            print(f"Importing {mapping}...")
            with open(mapping, "r") as f:
                serializer = MappingSerializer(data=json.load(f))
                if not serializer.is_valid():
                    # TODO clean exit
                    print(serializer.errors)
                    raise Exception
                serializer.save()
