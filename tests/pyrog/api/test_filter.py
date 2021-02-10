import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()


@pytest.mark.django_db
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


@pytest.mark.django_db
def test_retrieve_filter(api_client, filter):
    url = reverse("filters-detail", kwargs={"pk": filter.id})

    response = api_client.get(url)

    assert response.status_code == 200


@pytest.mark.django_db
def test_list_filters(api_client, filter_factory):
    url = reverse("filters-list")
    filter_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.django_db
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


@pytest.mark.django_db
def test_delete_filter(api_client, filter):
    url = reverse("filters-detail", kwargs={"pk": filter.id})

    response = api_client.delete(url)

    assert response.status_code == 204
