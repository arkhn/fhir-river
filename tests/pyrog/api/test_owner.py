from unittest import mock

import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
@pytest.mark.parametrize("name, status_code", [(faker.word(), 201)])
def test_create_owner(
    mock_database_explorer,
    mock_db_connection,
    api_client,
    name,
    credential,
    status_code,
):
    mock_database_explorer().get_owner_schema.return_value = faker.json()

    url = reverse("owners-list")

    data = {
        "name": name,
        "credential": credential.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


@pytest.mark.parametrize("name, status_code", [(faker.word(), 400)])
def test_create_owner_with_invalid_credential(
    api_client,
    name,
    credential,
    status_code,
):
    url = reverse("owners-list")

    data = {
        "name": name,
        "credential": credential.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
@pytest.mark.parametrize("name, status_code", [(faker.word(), 400)])
def test_create_owner_with_empty_schema(
    mock_database_explorer,
    mock_db_connection,
    api_client,
    name,
    credential,
    status_code,
):
    mock_database_explorer().get_owner_schema.return_value = {}

    url = reverse("owners-list")

    data = {
        "name": name,
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


def test_delete_owner(api_client, owner):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.delete(url)

    assert response.status_code == 204
