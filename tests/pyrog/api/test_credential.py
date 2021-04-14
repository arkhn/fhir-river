from unittest import mock

import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
@pytest.mark.parametrize(
    "host, port, database, login, password, model, status_code",
    [
        (
            faker.word(),
            faker.random_number(digits=4, fix_len=True),
            faker.word(),
            faker.word(),
            faker.word(),
            "MSSQL",
            201,
        ),
    ],
)
def test_create_credential(
    mock_database_explorer,
    mock_db_connection,
    api_client,
    source,
    host,
    port,
    database,
    login,
    password,
    model,
    status_code,
):
    mock_database_explorer().get_owners.return_value = []

    url = reverse("credentials-list")

    data = {
        "source": source.id,
        "host": host,
        "port": port,
        "database": database,
        "login": login,
        "password": password,
        "model": model,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


def test_create_invalid_credential(
    api_client,
    source,
):
    url = reverse("credentials-list")

    data = {
        "source": source.id,
        "host": "invalid",
        "port": 0,
        "database": "invalid",
        "login": "invalid",
        "password": "invalid",
        "model": "invalid",
    }
    response = api_client.post(url, data)

    assert response.status_code == 400


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
def test_retrieve_credential(mock_database_explorer, mock_db_connection, api_client, credential):
    mock_database_explorer().get_owners.return_value = []

    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.get(url)

    assert response.status_code == 200


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
def test_list_credentials(mock_database_explorer, mock_db_connection, api_client, credential_factory):
    mock_database_explorer().get_owners.return_value = []

    url = reverse("credentials-list")
    credential_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
def test_filter_credentials_by_source(
    mock_database_explorer,
    mock_db_connection,
    api_client,
    source_factory,
    credential_factory,
):
    mock_database_explorer().get_owners.return_value = []

    url = reverse("credentials-list")

    first_source, second_source = source_factory.create_batch(2)
    first_source_credentials = credential_factory.create_batch(1, source=first_source)
    credential_factory.create_batch(1, source=second_source)

    response = api_client.get(url, {"source": first_source.id})

    assert response.status_code == 200
    assert {credential_data["id"] for credential_data in response.json()} == {
        credential.id for credential in first_source_credentials
    }


@mock.patch("pyrog.api.serializers.DBConnection")
@mock.patch("pyrog.api.serializers.DatabaseExplorer")
@pytest.mark.parametrize(
    "host, port, database, login, password, model, status_code",
    [
        (
            None,
            faker.random_number(digits=4, fix_len=True),
            None,
            None,
            None,
            "POSTGRES",
            200,
        ),
    ],
)
def test_update_credential(
    mock_database_explorer,
    mock_db_connection,
    api_client,
    credential,
    host,
    port,
    database,
    login,
    password,
    model,
    status_code,
):
    mock_database_explorer().get_owners.return_value = []

    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    data = {}
    for field in ["host", "port", "database", "login", "password", "model"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code


def test_update_invalid_credential(
    api_client,
    credential,
):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    data = {
        "host": "invalid",
        "port": 0,
        "database": "invalid",
        "login": "invalid",
        "password": "invalid",
        "model": "invalid",
    }
    response = api_client.patch(url, data)

    assert response.status_code == 400


def test_delete_credential(api_client, credential):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.delete(url)

    assert response.status_code == 204
