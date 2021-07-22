from django.core.management.base import BaseCommand

from pdoc import cli as pdoc_cli


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--port", nargs=1, default="8080")

    def handle(self, *args, **options):
        args = pdoc_cli.parser.parse_args()
        args.modules = ["common", "pagai", "pyrog", "river", "users", "utils"]
        args.http = f"0.0.0.0:{options.get('port')}"
        pdoc_cli.main(_args=args)
