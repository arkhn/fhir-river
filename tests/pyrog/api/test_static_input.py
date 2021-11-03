import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("static_value, status_code", [(faker.word(), 201)])
def test_create_static_input(
    api_client,
    input_group,
    static_value,
    status_code,
):
    url = reverse("static-inputs-list")

    data = {"input_group": input_group.id, "static_value": static_value}
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


def test_retrieve_static_input(api_client, static_input):
    url = reverse("static-inputs-detail", kwargs={"pk": static_input.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_static_inputs(api_client, static_input_factory):
    url = reverse("static-inputs-list")
    static_input_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


def test_update_static_input(api_client, static_input):
    url = reverse("static-inputs-detail", kwargs={"pk": static_input.id})

    data = {"value": "new_value"}
    response = api_client.patch(url, data)

    assert response.status_code == 200, response.data
    assert response.json()["value"] == "new_value"


def test_delete_static_input(api_client, static_input):
    url = reverse("static-inputs-detail", kwargs={"pk": static_input.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_filter_static_inputs_by_input_group(api_client, input_group_factory, static_input_factory):
    url = reverse("static-inputs-list")
    first_input_group = input_group_factory()
    second_input_group = input_group_factory()
    first_input_group_inputs = static_input_factory.create_batch(2, input_group=first_input_group)
    static_input_factory.create_batch(3, input_group=second_input_group)

    response = api_client.get(url, {"input_group": first_input_group.id})

    assert response.status_code == 200, response.data
    assert {input_data["id"] for input_data in response.json()} == {input.id for input in first_input_group_inputs}


def test_filter_static_inputs_by_resource(
    api_client, input_group_factory, attribute_factory, resource_factory, static_input_factory
):
    url = reverse("static-inputs-list")

    first_resource = resource_factory()
    first_resource_attribute = attribute_factory.create(resource=first_resource)
    first_attribute_input_group = input_group_factory.create(attribute=first_resource_attribute)
    first_input_group_inputs = static_input_factory.create_batch(3, input_group=first_attribute_input_group)

    second_resource = resource_factory()
    second_resource_attribute = attribute_factory.create(resource=second_resource)
    second_attribute_input_group = input_group_factory.create(attribute=second_resource_attribute)
    static_input_factory.create_batch(4, input_group=second_attribute_input_group)

    response = api_client.get(url, {"resource": first_resource.id})

    assert response.status_code == 200, response.data
    assert {input_data["id"] for input_data in response.json()} == {input.id for input in first_input_group_inputs}