import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


def test_create_join(
    api_client,
    column,
):
    url = reverse("joins-list")

    data = {
        "column": column.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == 201


def test_retrieve_join(api_client, join):
    url = reverse("joins-detail", kwargs={"pk": join.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_list_joins(api_client, join_factory):
    url = reverse("joins-list")
    join_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


def test_delete_join(api_client, join):
    url = reverse("joins-detail", kwargs={"pk": join.id})

    response = api_client.delete(url)

    assert response.status_code == 204


def test_filter_joins_by_column(api_client, join_factory, column_factory):
    url = reverse("joins-list")

    first_column, second_column = column_factory.create_batch(2)
    first_column_joins = join_factory.create_batch(3, column=first_column)
    join_factory.create_batch(2, column=second_column)

    response = api_client.get(url, {"column": first_column.id})

    assert response.status_code == 200
    assert {join_data["id"] for join_data in response.json()} == {join.id for join in first_column_joins}
