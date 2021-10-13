import pytest
from faker import Faker

from django.urls import reverse

from dateutil.parser import parse

faker = Faker()

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("name, version, status_code", [(faker.word(), faker.word(), 201), ("", faker.word(), 400)])
def test_create_project(api_client, name, version, status_code):
    url = reverse("projects-list")

    data = {"name": name, "version": version}
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data


@pytest.mark.as_user
@pytest.mark.parametrize("name, version, status_code", [(faker.word(), faker.word(), 201), ("", faker.word(), 400)])
def test_create_and_assign_project(api_client, user, name, version, status_code):
    url = reverse("projects-list")

    data = {"name": name, "version": version}
    response = api_client.post(url, data)

    assert response.status_code == status_code, response.data

    if status_code != 201:
        return

    # Check that the new project has been assigned to the authenticated user
    assert user.projects.filter(id=response.data["id"]).exists()


@pytest.mark.as_user
def test_retrieve_project(api_client, project):
    url = reverse("projects-detail", kwargs={"pk": project.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data


@pytest.mark.as_user
@pytest.mark.export_data("valid/mimic.json")
def test_can_import_mapping(api_client, export_data):
    url = reverse("projects-list")

    response = api_client.post(url + "import/", export_data, format="json")

    assert response.status_code == 201, response.data


@pytest.mark.as_user
@pytest.mark.export_data("valid/mimic.json")
def test_can_import_mapping_several_times(api_client, export_data):
    url = reverse("projects-list")

    response = api_client.post(url + "import/", export_data, format="json")
    assert response.status_code == 201, response.data

    # Change project name
    export_data["name"] = "other_name"
    response = api_client.post(url + "import/", export_data, format="json")
    assert response.status_code == 201, response.data

    response = api_client.get(url)
    assert len(response.data) == 2


@pytest.mark.as_user
def test_list_projects(api_client, user, other_user, project_factory):
    url = reverse("projects-list")

    # Assign 3 projects to the authenticated user
    project_factory.create_batch(3, project_user__user=user)
    assert user.projects.count() == 3
    assert other_user.projects.count() == 0
    # Assign 3 other projects to the other user
    project_factory.create_batch(3, project_user__user=other_user)
    assert user.projects.count() == 3
    assert other_user.projects.count() == 3

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert {project.id for project in [*user.projects.all(), *other_user.projects.all()]} == {
        item["id"] for item in response.data
    }
    assert all(
        parse(response.data[i]["created_at"]) <= parse(response.data[i + 1]["created_at"])
        for i in range(len(response.data) - 1)
    )


@pytest.mark.as_user
@pytest.mark.parametrize("name, version, status_code", [(faker.word(), None, 200), (None, faker.word(), 200)])
def test_update_project(api_client, project, name, version, status_code):
    url = reverse("projects-detail", kwargs={"pk": project.id})

    data = {}
    if name:
        data["name"] = name
    if version:
        data["version"] = version
    response = api_client.patch(url, data)

    assert response.status_code == status_code, response.data


@pytest.mark.as_user
def test_delete_project(api_client, project):
    url = reverse("projects-detail", kwargs={"pk": project.id})

    response = api_client.delete(url)

    assert response.status_code == 204, response.data
