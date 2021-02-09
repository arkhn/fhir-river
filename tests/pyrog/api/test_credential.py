import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()


@pytest.mark.django_db
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

    assert response.status_code == status_code


@pytest.mark.django_db
def test_retrieve_credential(api_client, credential):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.get(url)

    assert response.status_code == 200


@pytest.mark.django_db
def test_list_credentials(api_client, credential_factory):
    url = reverse("credentials-list")
    credential_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.django_db
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
def test_update_credential(api_client, credential, host, port, database, login, password, model, status_code):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    data = {}
    for field in ["host", "port", "database", "login", "password", "model"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code


@pytest.mark.django_db
def test_delete_credential(api_client, credential):
    url = reverse("credentials-detail", kwargs={"pk": credential.id})

    response = api_client.delete(url)

    assert response.status_code == 204
