import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("table, column_field, status_code", [(faker.word(), faker.word(), 201)])
def test_create_column(
    api_client,
    join,
    sql_input_factory,
    owner,
    table,
    column_field,
    status_code,
):
    url = reverse("columns-list")

    data = {
        "join": join.id,
        "input": sql_input_factory().id,
        "owner": owner.id,
        "table": table,
        "column": column_field,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


def test_retrieve_column(api_client, column):
    url = reverse("columns-detail", kwargs={"pk": column.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_columns(api_client, column_factory):
    url = reverse("columns-list")
    column_factory.create_batch(3, with_join=False)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


@pytest.mark.parametrize("table, column_field, status_code", [(faker.word(), faker.word(), 200)])
def test_update_column(api_client, column, table, column_field, status_code):
    url = reverse("columns-detail", kwargs={"pk": column.id})

    data = {}
    if column_field:
        data["column"] = column_field
    for field in ["table"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


def test_delete_column(api_client, column):
    url = reverse("columns-detail", kwargs={"pk": column.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_filter_columns_by_join(api_client, join_factory, column_factory):
    url = reverse("columns-list")

    first_join, second_join = join_factory.create_batch(2)
    first_join_columns = column_factory.create_batch(2, join=first_join)
    column_factory.create_batch(2, join=second_join)

    response = api_client.get(url, {"join": first_join.id})

    assert response.status_code == 200, response.data
    assert {column_data["id"] for column_data in response.json()} == {column.id for column in first_join_columns}


def test_filter_columns_by_input(api_client, sql_input_factory, column_factory):
    url = reverse("columns-list")

    first_input, second_input = sql_input_factory.create_batch(2)
    first_input_column, second_input_column = column_factory.create_batch(2)

    first_input.column = first_input_column
    second_input.column = second_input_column
    first_input.save()
    second_input.save()

    response = api_client.get(url, {"sql_input": first_input.id})

    assert response.status_code == 200, response.data
    assert {column_data["id"] for column_data in response.json()} == {first_input_column.id}
