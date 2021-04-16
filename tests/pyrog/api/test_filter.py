import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("relation, value, status_code", [("<>", faker.word(), 201)])
def test_create_filter(
    api_client,
    relation,
    value,
    resource,
    column,
    status_code,
):
    url = reverse("filters-list")

    data = {
        "relation": relation,
        "value": value,
        "resource": resource.id,
        "sql_column": column.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


def test_retrieve_filter(api_client, filter):
    url = reverse("filters-detail", kwargs={"pk": filter.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_list_filters(api_client, filter_factory):
    url = reverse("filters-list")
    filter_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


def test_filter_filters_by_resource(api_client, filter_factory, resource_factory):
    url = reverse("filters-list")

    first_resource, second_resource = resource_factory.create_batch(2)
    first_resource_filters = filter_factory.create_batch(3, resource=first_resource)
    filter_factory.create_batch(2, resource=second_resource)

    response = api_client.get(url, {"resource": first_resource.id})

    assert response.status_code == 200
    assert {filter_data["id"] for filter_data in response.json()} == {filter.id for filter in first_resource_filters}


@pytest.mark.parametrize("relation, value, status_code", [("=", faker.word(), 200)])
def test_update_filter(
    api_client,
    filter,
    relation,
    value,
    status_code,
):
    url = reverse("filters-detail", kwargs={"pk": filter.id})

    data = {}
    for field in ["relation", "value"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code


def test_delete_filter(api_client, filter):
    url = reverse("filters-detail", kwargs={"pk": filter.id})

    response = api_client.delete(url)

    assert response.status_code == 204
