import json
import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

from pyrog.api.serializers.import_export import MappingWithPartialCredentialSerializer
from pyrog.models import Source

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--dest", required=True)

    def handle(self, *args, **options):
        call_command("migrate", "pyrog")
        dest_folder = options.get("dest")

        sources = Source.objects.all()
        for source in sources:
            new_mapping = MappingWithPartialCredentialSerializer(source).data
            with open(f"{dest_folder}/{source.name}.json", "w") as f:
                json.dump(new_mapping, f)
