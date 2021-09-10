import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


def test_create_join(api_client, sql_input, column_factory):
    url = reverse("joins-list")

    column_1 = column_factory()
    column_2 = column_factory()
    data = {
        "sql_input": sql_input.id,
        "left": column_1.id,
        "right": column_2.id,
    }
    response = api_client.post(url, data)

    assert response.status_code == 201, response.data


def test_retrieve_join(api_client, join):
    url = reverse("joins-detail", kwargs={"pk": join.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_joins(api_client, join_factory):
    url = reverse("joins-list")
    join_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


def test_delete_join(api_client, join):
    url = reverse("joins-detail", kwargs={"pk": join.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_filter_joins_by_sql_input(api_client, join_factory, sql_input_factory):
    url = reverse("joins-list")

    first_sql_input, second_sql_input = sql_input_factory.create_batch(2)
    first_sql_input_joins = join_factory.create_batch(3, sql_input=first_sql_input)
    join_factory.create_batch(2, sql_input=second_sql_input)

    response = api_client.get(url, {"sql_input": first_sql_input.id})

    assert response.status_code == 200, response.data
    assert {join_data["id"] for join_data in response.json()} == {join.id for join in first_sql_input_joins}
