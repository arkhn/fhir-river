import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "label, primary_key_table, primary_key_column, definition_id, logical_reference, status_code",
    [
        (faker.word(), faker.word(), faker.word(), faker.word(), faker.word(), 201),
        ("", faker.word(), faker.word(), faker.word(), faker.word(), 201),
    ],
)
def test_create_resource(
    api_client,
    source,
    owner,
    label,
    primary_key_table,
    primary_key_column,
    definition_id,
    logical_reference,
    status_code,
):
    url = reverse("resources-list")

    data = {
        "source": source.id,
        "primary_key_owner": owner.id,
        "label": label,
        "primary_key_table": primary_key_table,
        "primary_key_column": primary_key_column,
        "definition_id": definition_id,
        "logical_reference": logical_reference,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code

    # Check that logical_reference has been generated
    assert response.data["logical_reference"] != logical_reference


def test_retrieve_resource(api_client, resource):
    url = reverse("resources-detail", kwargs={"pk": resource.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_list_resources(api_client, resource_factory):
    url = reverse("resources-list")
    resource_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


def test_filter_resources_by_source(api_client, source_factory, resource_factory):
    url = reverse("resources-list")
    first_source, second_source = source_factory.create_batch(2)
    first_source_resources = resource_factory.create_batch(2, source=first_source)
    resource_factory.create_batch(2, source=second_source)

    response = api_client.get(url, {"source": first_source.id})

    assert response.status_code == 200
    assert {resource_data["id"] for resource_data in response.json()} == {
        resource.id for resource in first_source_resources
    }


@pytest.mark.parametrize("label, status_code", [(faker.word(), 200)])
def test_update_resource(api_client, resource, label, status_code):
    url = reverse("resources-detail", kwargs={"pk": resource.id})

    data = {}
    if label:
        data["label"] = label
    response = api_client.patch(url, data)

    assert response.status_code == status_code


def test_delete_resource(api_client, resource):
    url = reverse("resources-detail", kwargs={"pk": resource.id})

    response = api_client.delete(url)

    assert response.status_code == 204
