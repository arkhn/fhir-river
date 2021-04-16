from unittest import mock

import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@mock.patch("pyrog.api.serializers.basic.DBConnection")
@mock.patch("pyrog.api.serializers.basic.DatabaseExplorer")
@pytest.mark.parametrize("name, status_code", [(faker.word(), 201)])
def test_create_owner(
    mock_database_explorer,
    mock_db_connection,
    api_client,
    name,
    credential,
    status_code,
):
    schema = faker.json()
    mock_database_explorer().get_owner_schema.return_value = schema

    url = reverse("owners-list")

    data = {
        "name": name,
        "credential": credential.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code
    assert response.data["schema"] == schema


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


@mock.patch("pyrog.api.serializers.basic.DBConnection")
@mock.patch("pyrog.api.serializers.basic.DatabaseExplorer")
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


def test_filter_owners_by_credential(
    api_client,
    credential_factory,
    owner_factory,
):
    url = reverse("owners-list")

    first_credential, second_credential = credential_factory.create_batch(2)
    first_credential_owners = owner_factory.create_batch(3, credential=first_credential)
    owner_factory.create_batch(1, credential=second_credential)

    response = api_client.get(url, {"credential": first_credential.id})

    assert response.status_code == 200
    assert {owner_data["id"] for owner_data in response.json()} == {owner.id for owner in first_credential_owners}


def test_delete_owner(api_client, owner):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.delete(url)

    assert response.status_code == 204
