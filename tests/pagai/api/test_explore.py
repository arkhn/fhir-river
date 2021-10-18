import datetime

import pytest

from django.urls import reverse

import pandas as pd

pytestmark = pytest.mark.django_db


def test_explore(
    api_client,
    resource,
):
    url = reverse("explore")

    data = {"resource_id": resource.id, "owner": "public", "table": "patients"}
    response = api_client.post(url, data)

    assert response.status_code == 200, response.data

    # the following data corresponds to the tests/pagai/data/patients.csv file
    # make sure you update the test if you change this file.
    expected = pd.DataFrame(
        [["F", datetime.datetime(1974, 3, 5, 0, 0), 0, 1], ["M", datetime.datetime(1969, 12, 21, 0, 0), 1, 2]],
        columns=["gender", "date", "index", "patient_id"],
    ).sort_index(axis="columns")

    assert (
        pd.DataFrame(response.data["rows"], columns=response.data["fields"])
        .sort_index(axis="columns")
        .equals(expected)
    )
