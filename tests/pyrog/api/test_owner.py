import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("name, status_code", [("public", 201), ("NOT_A_VALID_OWNER", 400)])
def test_create_owner(
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

    assert response.status_code == status_code, response.data


def test_retrieve_owner(api_client, owner):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_owners(api_client, owner_factory):
    url = reverse("owners-list")
    owner_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3


def test_filter_owners_by_credential(
    api_client,
    credential_factory,
    owner_factory,
):
    url = reverse("owners-list")

    first_credential, second_credential = credential_factory.create_batch(2)
    first_credential_owners = owner_factory.create_batch(3, credential=first_credential)
    owner_factory.create(credential=second_credential)

    response = api_client.get(url, {"credential": first_credential.id})

    assert response.status_code == 200, response.data
    assert {owner_data["id"] for owner_data in response.json()} == {owner.id for owner in first_credential_owners}


@pytest.mark.parametrize("name, status_code", [("public", 200), ("NOT_A_VALID_OWNER", 400)])
def test_update_owner(
    api_client,
    owner,
    name,
    status_code,
):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    data = {"name": name}
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


def test_delete_owner(api_client, owner):
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_delete_owner_conflict_resource(api_client, owner, resource_factory):
    resource_factory.create(primary_key_owner=owner)
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.delete(url)

    assert response.status_code == 409, response.data


def test_delete_owner_conflict_column(api_client, owner, column_factory):
    column_factory.create(owner=owner)
    url = reverse("owners-detail", kwargs={"pk": owner.id})

    response = api_client.delete(url)

    assert response.status_code == 409, response.data
