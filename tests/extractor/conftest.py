import os

import django
from dotenv import find_dotenv, load_dotenv


def pytest_configure():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "river.settings.dev")
    load_dotenv(find_dotenv())

    django.setup()