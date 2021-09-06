import pytest
from faker import Faker

from django.conf import settings
from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "host, port, database, login, password, model, status_code",
    [
        (
            settings.DATABASES["default"]["HOST"],
            settings.DATABASES["default"]["PORT"],
            settings.DATABASES["default"]["NAME"],
            settings.DATABASES["default"]["USER"],
            settings.DATABASES["default"]["PASSWORD"],
            "POSTGRES",
            201,
        ),
        (
            settings.DATABASES["default"]["HOST"],
            settings.DATABASES["default"]["PORT"],
            settings.DATABASES["default"]["NAME"],
            settings.DATABASES["default"]["USER"],
            "NOT_THE_PASSWORD",
            "POSTGRES",
            400,
        ),
    ],
)
def test_create_credential(
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

    assert response.status_code == status_code, response.data


def test_retrieve_credential(api_client, credential):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_retrieve_credential_without_password(api_client, credential_factory):
    credential = credential_factory.create(password="")
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.get(url)

    assert response.data["available_owners"] == []
    assert response.status_code == 200, response.data


def test_list_credentials(api_client, credential_factory):
    url = reverse("credentials-list")
    credential_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


def test_filter_credentials_by_source(
    api_client,
    source_factory,
    credential_factory,
):
    url = reverse("credentials-list")

    first_source, second_source = source_factory.create_batch(2)
    first_source_credentials = credential_factory.create(source=first_source)
    credential_factory.create(source=second_source)

    response = api_client.get(url, {"source": first_source.id})

    assert response.status_code == 200, response.data
    assert {credential_data["id"] for credential_data in response.json()} == {first_source_credentials.id}


@pytest.mark.parametrize(
    "host, port, database, login, password, model, status_code",
    [
        (
            None,
            None,
            None,
            None,
            None,
            "POSTGRES",
            200,
        ),
        (
            "INVALID_HOST",
            None,
            None,
            None,
            None,
            None,
            400,
        ),
    ],
)
def test_update_credential(
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
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    data = {}
    for field in ["host", "port", "database", "login", "password", "model"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


def test_delete_credential(api_client, credential):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data
