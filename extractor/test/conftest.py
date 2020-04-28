import json
from pytest import fixture


@fixture(scope="session")
def patient_mapping():
    with open("transformer/test/fixtures/patient_mapping.json", "r") as fp:
        return json.load(fp)
