import pytest

from django.urls import reverse

pytestmark = [pytest.mark.django_db]


def test_joins_order(api_client, mimic_mapping):
    # NOTE
    # To run mimic: dc -f docker-compose.test.yml up mimic
    # Also, I've changed mimic_mapping so that it matches the
    # one from testy
    url = reverse("sources-list")

    response = api_client.post(url + "import/", mimic_mapping, format="json")
    assert response.status_code == 201
 
    source_id = response.json()["id"]
    url = reverse("sources-export-mapping", kwargs={"pk": source_id})
    response = api_client.get(url)

    exported_mapping = response.json()

    # existing_joins = (
    #     ("patients", "admissions"),
    #     ("admissions", "services"),
    #     ("diagnoses_icd", "d_icd_diagnoses"),
    #     ("procedures_icd", "d_icd_procedures"),
    # )

    # col_dict = {col["id"]: col for owner in mimic_mapping["credential"]["owners"] for col in owner["columns"]}
    # for owner in mimic_mapping["credential"]["owners"]:
    #     for col in owner["columns"]:
    #         if col["joins"]:
    #             for join in col["joins"]:
    #                 left_table = col_dict[join["columns"][0]]["table"]
    #                 right_table = col_dict[join["columns"][1]]["table"]
    #                 print("------")
    #                 print(left_table)
    #                 print(right_table)
    #                 print("------")
    #                 assert (left_table, right_table) in existing_joins

    # col_dict = {col["id"]: col for owner in exported_mapping["credential"]["owners"] for col in owner["columns"]}
    # for owner in exported_mapping["credential"]["owners"]:
    #     for col in owner["columns"]:
    #         if col["joins"]:
    #             for join in col["joins"]:
    #                 left_table = col_dict[join["columns"][0]]["table"]
    #                 right_table = col_dict[join["columns"][1]]["table"]
    #                 assert (left_table, right_table) in existing_joins

    resource_id = exported_mapping["resources"][0]["id"]
    url = reverse("preview")
    response = api_client.post(url, {"resource_id": resource_id, "primary_key_values": [10006]}, format="json")

    print(response.json())
    assert 0
