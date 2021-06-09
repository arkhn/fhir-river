from datetime import date, datetime
from decimal import Decimal
from unittest import mock

from django.urls import reverse

from common.kafka.producer import CustomJSONEncoder


def mock_get_script(_name):
    return lambda arg: arg.encode("utf-8").decode("unicode_escape")


def test_encode_decimal():
    encoded = CustomJSONEncoder().default(Decimal("5.0"))
    assert encoded == 5.0

    encoded = CustomJSONEncoder().default(Decimal("5"))
    assert encoded == 5.0


def test_encode_datetime():
    encoded = CustomJSONEncoder().default(date(2020, 10, 10))
    assert encoded == "2020-10-10"

    encoded = CustomJSONEncoder().default(datetime(2020, 10, 10, 12, 12, 12))
    assert encoded == "2020-10-10T12:12:12"


@mock.patch("control.api.preview.Extractor")
@mock.patch("control.api.preview.fetch_resource_mapping")
@mock.patch("common.analyzer.cleaning_script.scripts.get_script", mock_get_script)
def test_serde_and_clean_bytes(mock_fetch_mapping, mock_extractor, api_client):
    extractor = mock.MagicMock()
    extractor.split_dataframe.return_value = [
        {
            "doc_crid_fdce888f": [123],
            "doc_cr_d890320c": [b"Il est rest\\xe9 \\xe0 jeun."],
        }
    ]
    mock_extractor.return_value = extractor
    mock_fetch_mapping.return_value = {
        "id": "ckdyl65kh0125gu9kpvjbja6j",
        "logicalReference": "415e76f4-44f4-4a19-942d-7550ea9f4161",
        "definitionId": "DocumentReference",
        "filters": [],
        "primaryKeyOwner": {"name": "mimiciii"},
        "primaryKeyTable": "doc",
        "primaryKeyColumn": "crid",
        "source": {
            "id": "ckdyl65ip0010gu9k22w8kvc1",
            "credential": {
                "owner": None,
                "model": "POSTGRES",
                "login": "login",
                "password": "password",
                "host": "host",
                "port": "10",
                "database": "database",
            },
        },
        "attributes": [
            {
                "path": "description",
                "sliceName": None,
                "definitionId": "string",
                "inputGroups": [
                    {
                        "id": "ckdyl65kh0127gu9kqdxatrks",
                        "mergingScript": None,
                        "attributeId": "ckdyl65kh0126gu9ka6svbibj",
                        "inputs": [
                            {
                                "script": "clean",
                                "conceptMapId": None,
                                "staticValue": None,
                                "sqlValue": {
                                    "table": "doc",
                                    "owner": {"name": "mimiciii"},
                                    "column": "cr",
                                    "joins": [],
                                },
                            }
                        ],
                        "conditions": [],
                    }
                ],
            },
        ],
        "definition": {"id": "Patient", "type": "DocumentReference"},
    }

    url = reverse("preview-list")
    data = {
        "resource_id": "foo",
        "primary_key_values": ["PK"],
    }
    response = api_client.post(url, data=data, format="json")
    assert response.status_code == 200
    assert response.data["instances"][0]["description"] == "Il est resté à jeun."
