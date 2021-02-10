import pytest
from faker import Faker

from django.urls import reverse

faker = Faker()


@pytest.mark.django_db
@pytest.mark.parametrize("action, value, relation, status_code", [("INCLUDE", faker.word(), "EQ", 201)])
def test_create_condition(
    api_client,
    action,
    column,
    value,
    input_group,
    relation,
    status_code,
):
    url = reverse("conditions-list")

    data = {
        "action": action,
        "column": column.id,
        "value": value,
        "input_group": input_group.id,
        "relation": relation,
    }
    response = api_client.post(url, data)

    assert response.status_code == status_code


@pytest.mark.django_db
def test_retrieve_condition(api_client, condition):
    url = reverse("conditions-detail", kwargs={"pk": condition.id})

    response = api_client.get(url)

    assert response.status_code == 200


@pytest.mark.django_db
def test_list_conditions(api_client, condition_factory):
    url = reverse("conditions-list")
    condition_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.django_db
@pytest.mark.parametrize("action, value, relation, status_code", [("EXCLUDE", faker.word(), "GT", 200)])
def test_update_condition(
    api_client,
    condition,
    action,
    value,
    relation,
    status_code,
):
    url = reverse("conditions-detail", kwargs={"pk": condition.id})

    data = {}
    for field in ["action", "value", "relation"]:
        if locals()[field]:
            data[field] = locals()[field]
    response = api_client.patch(url, data)

    assert response.status_code == status_code


@pytest.mark.django_db
def test_delete_condition(api_client, condition):
    url = reverse("conditions-detail", kwargs={"pk": condition.id})

    response = api_client.delete(url)

    assert response.status_code == 204
