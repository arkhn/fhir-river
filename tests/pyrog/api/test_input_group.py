import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()


@pytest.mark.django_db
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

    assert response.status_code == status_code


@pytest.mark.django_db
def test_retrieve_input_group(api_client, input_group):
    url = reverse("input-groups-detail", kwargs={"pk": input_group.id})

    response = api_client.get(url)

    assert response.status_code == 200


@pytest.mark.django_db
def test_list_input_groups(api_client, input_group_factory):
    url = reverse("input-groups-list")
    input_group_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.django_db
@pytest.mark.parametrize("merging_script, status_code", [(faker.word(), 200)])
def test_update_input_group(api_client, input_group, merging_script, status_code):
    url = reverse("input-groups-detail", kwargs={"pk": input_group.id})

    data = {}
    for field in ["merging_script"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code


@pytest.mark.django_db
def test_delete_input_group(api_client, input_group):
    url = reverse("input-groups-detail", kwargs={"pk": input_group.id})

    response = api_client.delete(url)

    assert response.status_code == 204
