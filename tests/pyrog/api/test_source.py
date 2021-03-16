import pytest
from faker import Faker

from django.urls import reverse

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


@pytest.mark.export_data("valid/0003.json")
def test_create_full_source(api_client, export_data):
    url = reverse("sources-list")

    response = api_client.post(url + "?full=True", export_data, format="json")

    assert response.status_code == 201


def test_retrieve_full_source(
    snapshot, api_client, source, resource, attribute, input_group, input, column, condition
):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url, {"full": True})

    assert response.status_code == 200
    assert response.json() == snapshot


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
