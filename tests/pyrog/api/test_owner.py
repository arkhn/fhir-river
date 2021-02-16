import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("name, schema, status_code", [(faker.word(), faker.json(), 201)])
def test_create_owner(
    api_client,
    name,
    schema,
    credential,
    status_code,
):
    url = reverse("owners-list")

    data = {
        "name": name,
        "schema": schema,
        "credential": credential.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


def test_retrieve_owner(api_client, owner):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_list_owners(api_client, owner_factory):
    url = reverse("owners-list")
    owner_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.parametrize("name, schema, status_code", [(faker.word(), faker.json(), 200)])
def test_update_owner(
    api_client,
    owner,
    name,
    schema,
    status_code,
):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    data = {}
    for field in ["name", "schema"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code


def test_delete_owner(api_client, owner):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.delete(url)

    assert response.status_code == 204
