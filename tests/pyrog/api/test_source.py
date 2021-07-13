import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("name, version, status_code", [(faker.word(), faker.word(), 201), ("", faker.word(), 400)])
def test_create_source(api_client, name, version, status_code):
    url = reverse("sources-list")

    data = {"name": name, "version": version}
    response = api_client.post(url, data)

    assert response.status_code == status_code


@pytest.mark.as_user
@pytest.mark.parametrize("name, version, status_code", [(faker.word(), faker.word(), 201), ("", faker.word(), 400)])
def test_create_and_assign_source(api_client, user, name, version, status_code):
    url = reverse("sources-list")

    data = {"name": name, "version": version}
    response = api_client.post(url, data)

    assert response.status_code == status_code

    if status_code != 201:
        return

    # Check that the new source has been assigned to the authenticated user
    assert user.sources.filter(id=response.data["id"]).exists()


@pytest.mark.as_user
def test_retrieve_source(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_retrieve_source_unauthenticated(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url)

    assert response.status_code == 404


@pytest.mark.as_other_user
def test_retrieve_source_forbidden(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url)

    assert response.status_code == 404


@pytest.mark.as_user
@pytest.mark.export_data("valid/0003.json")
def test_create_full_source(api_client, export_data):
    url = reverse("sources-list")

    response = api_client.post(url + "?full=True", export_data, format="json")

    assert response.status_code == 201


@pytest.mark.as_user
def test_retrieve_full_source(
    snapshot,
    reset_factories_sequences,
    api_client,
    source,
    credential,
    resource,
    attribute,
    input_group,
    input,
    column,
    condition,
):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.get(url, {"full": True})

    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.as_user
def test_list_sources(api_client, user, other_user, source_factory):
    url = reverse("sources-list")

    # Assign 3 sources to the authenticated user
    source_factory.create_batch(3, source_user__user=user)
    assert user.sources.count() == 3
    assert other_user.sources.count() == 0
    # Assign 3 other sources to the other user
    source_factory.create_batch(3, source_user__user=other_user)
    assert user.sources.count() == 3
    assert other_user.sources.count() == 3

    response = api_client.get(url)

    assert response.status_code == 200
    assert {source.id for source in user.sources.all()} == {item["id"] for item in response.data}
    assert all(source.id not in {item["id"] for item in response.data} for source in other_user.sources.all())
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


def test_list_sources_unauthenticated(api_client, source):
    url = reverse("sources-list")

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 0


@pytest.mark.as_user
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


def test_update_source_unauthenticated(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    data = {"name": faker.word()}
    response = api_client.patch(url, data)

    assert response.status_code == 404


@pytest.mark.as_other_user
def test_update_source_forbidden(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    data = {"name": faker.word()}
    response = api_client.patch(url, data)

    assert response.status_code == 404


@pytest.mark.as_user
def test_delete_source(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.delete(url)

    assert response.status_code == 204


def test_delete_source_unauthenticated(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.delete(url)

    assert response.status_code == 404


@pytest.mark.as_other_user
def test_delete_source_forbidden(api_client, source):
    url = reverse("sources-detail", kwargs={"pk": source.id})

    response = api_client.delete(url)

    assert response.status_code == 404
