import pytest
from faker import Faker

from django.urls import reverse

from pyrog.models import Attribute, Column, Condition, Filter, Input, InputGroup, Join, Resource, Source

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("name, version, status_code", [(faker.word(), faker.word(), 201), ("", faker.word(), 400)])
def test_create_source(api_client, name, version, status_code):
    url = reverse("sources-list")

    data = {"name": name, "version": version}
    response = api_client.post(url, data)

    assert response.status_code == status_code


def test_retrieve_source(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_create_full_source(api_client, exported_source):
    url = reverse("sources-list")

    response = api_client.post(url + "?full=True", exported_source, format="json")

    assert response.status_code == 201
    assert Source.objects.count() == 1
    assert Resource.objects.count() == 5
    assert Attribute.objects.count() == 35
    assert InputGroup.objects.count() == 15
    assert Input.objects.count() == 16
    assert Column.objects.count() == 27
    assert Condition.objects.count() == 3
    assert Filter.objects.count() == 1
    assert Join.objects.count() == 7


def test_retrieve_full_source(api_client, source, resource, attribute, input_group, input, column, condition):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url, {"full": True})

    assert response.status_code == 200
    assert "resources" in response.data
    assert "credential" in response.data
    assert "owners" in response.data["credential"]
    assert "id" in response.data["credential"]["owners"][0]
    assert "columns" in response.data["credential"]["owners"][0]
    assert "joins" in response.data["credential"]["owners"][0]["columns"][0]
    assert "id" in response.data["credential"]["owners"][0]["columns"][0]
    assert "primary_key_owner" in response.data["resources"][0]
    assert "filters" in response.data["resources"][0]
    assert "attributes" in response.data["resources"][0]
    assert "input_groups" in response.data["resources"][0]["attributes"][0]
    assert "inputs" in response.data["resources"][0]["attributes"][0]["input_groups"][0]
    assert "column" in response.data["resources"][0]["attributes"][0]["input_groups"][0]["inputs"][0]
    assert "conditions" in response.data["resources"][0]["attributes"][0]["input_groups"][0]


def test_list_sources(api_client, source_factory):
    url = reverse("sources-list")
    source_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.parametrize("name, version, status_code", [(faker.word(), None, 200), (None, faker.word(), 200)])
def test_update_source(api_client, source, name, version, status_code):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    data = {}
    if name:
        data["name"] = name
    if version:
        data["version"] = version
    response = api_client.patch(url, data)

    assert response.status_code == status_code


def test_delete_source(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.delete(url)

    assert response.status_code == 204
