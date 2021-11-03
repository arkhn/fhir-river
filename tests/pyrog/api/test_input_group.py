import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()


pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("merging_script, status_code", [(faker.word(), 201)])
def test_create_input_group(
    api_client,
    attribute,
    merging_script,
    status_code,
):
    url = reverse("input-groups-list")

    data = {
        "attribute": attribute.id,
        "merging_script": merging_script,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


def test_retrieve_input_group(api_client, input_group):
    url = reverse("input-groups-detail", kwargs={"pk": input_group.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


def test_list_input_groups(api_client, input_group_factory):
    url = reverse("input-groups-list")
    input_group_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert len(response.data) == 3
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


@pytest.mark.parametrize("merging_script, status_code", [(faker.word(), 200)])
def test_update_input_group(api_client, input_group, merging_script, status_code):
    url = reverse("input-groups-detail", kwargs={"pk": input_group.id})

    data = {}
    for field in ["merging_script"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


def test_delete_input_group(api_client, input_group):
    url = reverse("input-groups-detail", kwargs={"pk": input_group.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data


def test_filter_input_groups_by_attribute(api_client, attribute_factory, input_group_factory):
    url = reverse("input-groups-list")
    first_attribute = attribute_factory()
    second_attribute = attribute_factory()
    first_attribute_input_groups = input_group_factory.create_batch(2, attribute=first_attribute)
    input_group_factory.create_batch(3, attribute=second_attribute)

    response = api_client.get(url, {"attribute": first_attribute.id})

    assert response.status_code == 200, response.data
    assert {input_group_data["id"] for input_group_data in response.json()} == {
        input_group.id for input_group in first_attribute_input_groups
    }


def test_filter_input_groups_by_resource(api_client, resource_factory, attribute_factory, input_group_factory):
    url = reverse("input-groups-list")

    first_resource = resource_factory.create()
    first_resource_attribute = attribute_factory.create(resource=first_resource)
    first_attribute_input_groups = input_group_factory.create_batch(2, attribute=first_resource_attribute)

    second_resource = resource_factory.create()
    second_resource_attribute = attribute_factory.create(resource=second_resource)
    input_group_factory.create_batch(3, attribute=second_resource_attribute)

    response = api_client.get(url, {"resource": first_resource.id})

    assert response.status_code == 200, response.data
    assert {input_group_data["id"] for input_group_data in response.json()} == {
        input_group.id for input_group in first_attribute_input_groups
    }
