import os

from dotenv import find_dotenv, load_dotenv

import django

import pytest


def pytest_configure():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "river.settings.dev")
    load_dotenv(find_dotenv())

    django.setup()


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()
