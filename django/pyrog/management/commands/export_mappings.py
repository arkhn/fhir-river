import json
import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

from pyrog.api.serializers.mapping import MappingWithPartialCredentialSerializer
from pyrog.models import Project

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Django command to export to json files the serialized mappings of all the
    existing projects.

    For an exmaple of how to use this command to update mappings between 2 migrations,
    see https://github.com/arkhn/fhir-river/blob/main/django/pyrog/README.md.
    """

    def add_arguments(self, parser):
        parser.add_argument("--dest", required=True, help="path to the folder where the new mappings will be written")

    def handle(self, *args, **options):
        call_command("migrate", "pyrog")

        dest_folder = options.get("dest")

        projects = Project.objects.all()
        for project in projects:
            new_mapping = MappingWithPartialCredentialSerializer(project).data
            with open(f"{dest_folder}/{project.name}.json", "w") as f:
                json.dump(new_mapping, f)
