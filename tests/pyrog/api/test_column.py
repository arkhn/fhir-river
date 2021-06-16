import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("table, column_field, status_code", [(faker.word(), faker.word(), 201)])
def test_create_column(
    api_client,
    join,
    input_factory,
    owner,
    table,
    column_field,
    status_code,
):
    url = reverse("columns-list")

    data = {
        "join": join.id,
        "input": input_factory().id,
        "owner": owner.id,
        "table": table,
        "column": column_field,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


@pytest.fixture(params=[True, False], ids=["With join", "Without join"])
def x_column(request, column_factory):
    return column_factory(with_join=request.param)


def test_retrieve_column(api_client, x_column):
    url = reverse("columns-detail", kwargs={"pk": x_column.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_list_columns(api_client, column_factory):
    url = reverse("columns-list")
    column_factory.create_batch(3, with_join=False)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


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

    assert response.status_code == status_code


def test_delete_column(api_client, column):
    url = reverse("columns-detail", kwargs={"pk": column.id})

    response = api_client.delete(url)

    assert response.status_code == 204


def test_filter_columns_by_join(api_client, join_factory, column_factory):
    url = reverse("columns-list")

    first_join, second_join = join_factory.create_batch(2)
    first_join_columns = column_factory.create_batch(2, join=first_join)
    column_factory.create_batch(2, join=second_join)

    response = api_client.get(url, {"join": first_join.id})

    assert response.status_code == 200
    assert {column_data["id"] for column_data in response.json()} == {column.id for column in first_join_columns}

def test_filter_columns_by_input(api_client, input_factory, column_factory):
    url = reverse("columns-list")

    first_input, second_input = input_factory.create_batch(2)
    first_input_columns = column_factory.create_batch(2, input=first_input)
    column_factory.create_batch(2, input=second_input)

    response = api_client.get(url, {"input": first_input.id})

    assert response.status_code == 200
    assert {column_data["id"] for column_data in response.json()} == {column.id for column in first_input_columns}
