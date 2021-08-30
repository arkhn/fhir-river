import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "script, concept_map_id, static_value, status_code", [(faker.word(), faker.word(), faker.word(), 201)]
)
def test_create_input(
    api_client,
    input_group,
    script,
    concept_map_id,
    static_value,
    status_code,
):
    url = reverse("inputs-list")

    data = {
        "input_group": input_group.id,
        "script": script,
        "concept_map_id": concept_map_id,
        "static_value": static_value,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


def test_retrieve_input(api_client, input):
    url = reverse("inputs-detail", kwargs={"pk": input.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_inputs(api_client, input_factory):
    url = reverse("inputs-list")
    input_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


@pytest.mark.parametrize(
    "script, concept_map_id, static_value, status_code", [(faker.word(), faker.word(), faker.word(), 200)]
)
def test_update_input(api_client, input, script, concept_map_id, static_value, status_code):
    url = reverse("inputs-detail", kwargs={"pk": input.id})

    data = {}
    for field in ["script"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


def test_delete_input(api_client, input):
    url = reverse("inputs-detail", kwargs={"pk": input.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_filter_inputs_by_input_group(api_client, input_group_factory, input_factory):
    url = reverse("inputs-list")
    first_input_group = input_group_factory()
    second_input_group = input_group_factory()
    first_input_group_inputs = input_factory.create_batch(2, input_group=first_input_group)
    input_factory.create_batch(3, input_group=second_input_group)

    response = api_client.get(url, {"input_group": first_input_group.id})

    assert response.status_code == 200, response.data
    assert {input_data["id"] for input_data in response.json()} == {input.id for input in first_input_group_inputs}
