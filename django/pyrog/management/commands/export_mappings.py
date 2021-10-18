import json
import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

from pyrog.api.serializers.mapping import MappingWithPartialCredentialSerializer
from pyrog.models import Source

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Django command to export to json files the serialized mappings of all the
    existing sources.

    For an exmaple of how to use this command to update mappings between 2 migrations,
    see https://github.com/arkhn/fhir-river/blob/main/django/pyrog/README.md.
    """

    def add_arguments(self, parser):
        parser.add_argument("--dest", required=True, help="path to the folder where the new mappings will be written")

    def handle(self, *args, **options):
        call_command("migrate", "pyrog")

        dest_folder = options.get("dest")

        sources = Source.objects.all()
        for source in sources:
            new_mapping = MappingWithPartialCredentialSerializer(source).data
            with open(f"{dest_folder}/{source.name}.json", "w") as f:
                json.dump(new_mapping, f)
