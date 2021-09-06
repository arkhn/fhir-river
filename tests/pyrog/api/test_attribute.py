import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "path, slice_name, definition_id, status_code",
    [
        (faker.word(), faker.word(), faker.word(), 201),
    ],
)
def test_create_attribute(
    api_client,
    resource,
    path,
    slice_name,
    definition_id,
    status_code,
):
    url = reverse("attributes-list")

    data = {
        "resource": resource.id,
        "path": path,
        "slice_name": slice_name,
        "definition_id": definition_id,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


def test_retrieve_attribute(api_client, attribute):
    url = reverse("attributes-detail", kwargs={"pk": attribute.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_attributes(api_client, attribute_factory):
    url = reverse("attributes-list")
    attribute_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


def test_filter_attributes_by_resource(api_client, resource_factory, attribute_factory):
    url = reverse("attributes-list")
    first_resource = resource_factory()
    second_resource = resource_factory()
    first_resource_attributes = attribute_factory.create_batch(2, resource=first_resource)
    attribute_factory.create_batch(3, resource=second_resource)

    response = api_client.get(url, {"resource": first_resource.id})

    assert response.status_code == 200, response.data
    assert {attribute_data["id"] for attribute_data in response.json()} == {
        attribute.id for attribute in first_resource_attributes
    }


def test_filter_attributes_by_source(api_client, source_factory, resource_factory, attribute_factory):
    url = reverse("attributes-list")
    first_source, second_source = source_factory.create_batch(2)
    first_resource = resource_factory(source=first_source)
    second_resource = resource_factory(source=second_source)
    first_source_attributes = attribute_factory.create_batch(2, resource=first_resource)
    attribute_factory.create_batch(3, resource=second_resource)

    response = api_client.get(url, {"source": first_source.id})

    assert response.status_code == 200, response.data
    assert {attribute_data["id"] for attribute_data in response.json()} == {
        attribute.id for attribute in first_source_attributes
    }


@pytest.mark.parametrize(
    "path, slice_name, definition_id, status_code", [(faker.word(), faker.word(), faker.word(), 200)]
)
def test_update_attribute(api_client, attribute, path, slice_name, definition_id, status_code):
    url = reverse("attributes-detail", kwargs={"pk": attribute.id})

    data = {}
    for field in ["path", "slice_name", "definition_id"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


def test_delete_attribute(api_client, attribute):
    url = reverse("attributes-detail", kwargs={"pk": attribute.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data
