from django.core.management.base import BaseCommand

from pdoc import cli as pdoc_cli


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--http", default="0.0.0.0:8080", metavar="HOST:PORT")

    def handle(self, *args, **options):
        args = pdoc_cli.parser.parse_args()
        args.modules = ["common", "pagai", "pyrog", "river", "users", "utils"]
        args.http = options.get("http")
        pdoc_cli.main(_args=args)
