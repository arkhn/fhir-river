import pytest
from faker import Faker

from django.urls import reverse

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

    assert response.status_code == status_code


def test_retrieve_attribute(api_client, attribute):
    url = reverse("attributes-detail", kwargs={"pk": attribute.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_list_attributes(api_client, attribute_factory):
    url = reverse("attributes-list")
    attribute_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


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

    assert response.status_code == status_code


def test_delete_attribute(api_client, attribute):
    url = reverse("attributes-detail", kwargs={"pk": attribute.id})

    response = api_client.delete(url)

    assert response.status_code == 204
