import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("script, concept_map_id, status_code", [(faker.word(), faker.word(), 201)])
def test_create_sql_input(
    api_client,
    input_group,
    column,
    script,
    concept_map_id,
    status_code,
):
    url = reverse("sql-inputs-list")

    data = {"input_group": input_group.id, "column": column.id, "script": script, "concept_map_id": concept_map_id}
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


def test_retrieve_sql_input(api_client, sql_input):
    url = reverse("sql-inputs-detail", kwargs={"pk": sql_input.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_sql_inputs(api_client, sql_input_factory):
    url = reverse("sql-inputs-list")
    sql_input_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


def test_update_sql_input(api_client, sql_input, column):
    url = reverse("sql-inputs-detail", kwargs={"pk": sql_input.id})

    data = {"column": column.id, "script": "new_script", "concept_map_id": "concept_map_id"}
    response = api_client.patch(url, data)

    assert response.status_code == 200, response.data
    assert response.json()["column"] == column.id
    assert response.json()["script"] == "new_script"
    assert response.json()["concept_map_id"] == "concept_map_id"


def test_delete_sql_input(api_client, sql_input):
    url = reverse("sql-inputs-detail", kwargs={"pk": sql_input.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_filter_sql_inputs_by_input_group(api_client, input_group_factory, sql_input_factory):
    url = reverse("sql-inputs-list")
    first_input_group = input_group_factory()
    second_input_group = input_group_factory()
    first_input_group_inputs = sql_input_factory.create_batch(2, input_group=first_input_group)
    sql_input_factory.create_batch(3, input_group=second_input_group)

    response = api_client.get(url, {"input_group": first_input_group.id})

    assert response.status_code == 200, response.data
    assert {input_data["id"] for input_data in response.json()} == {input.id for input in first_input_group_inputs}


def test_filter_sql_inputs_by_resource(
    api_client, input_group_factory, attribute_factory, resource_factory, sql_input_factory
):
    url = reverse("sql-inputs-list")

    first_resource = resource_factory()
    first_resource_attribute = attribute_factory.create(resource=first_resource)
    first_attribute_input_group = input_group_factory.create(attribute=first_resource_attribute)
    first_input_group_inputs = sql_input_factory.create_batch(3, input_group=first_attribute_input_group)

    second_resource = resource_factory()
    second_resource_attribute = attribute_factory.create(resource=second_resource)
    second_attribute_input_group = input_group_factory.create(attribute=second_resource_attribute)
    sql_input_factory.create_batch(4, input_group=second_attribute_input_group)

    response = api_client.get(url, {"resource": first_resource.id})

    assert response.status_code == 200, response.data
    assert {input_data["id"] for input_data in response.json()} == {input.id for input in first_input_group_inputs}
