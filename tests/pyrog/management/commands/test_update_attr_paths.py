import pytest

from django.urls import reverse

from pyrog.management.commands.update_attr_paths import Command

pytestmark = pytest.mark.django_db


def test_attribute_paths_update(api_client, resource_factory, attribute_factory):
    url = reverse("attributes-list")

    [resource] = resource_factory.create_batch(1, definition={"type": "Patient"})
    attribute_factory.create_batch(1, resource=resource.id, path="id")

    cmd = Command()
    cmd.handle()

    response = api_client.get(url)
    [attribute] = response.json()

    assert attribute["path"] == "Patient.id"
