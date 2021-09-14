from common.adapters.fhir_api import HapiFhirAPI


def test_fhir_api():
    fhir_api = HapiFhirAPI()

    assert fhir_api._headers == {"Cache-Control": "no-cache", "Content-Type": "application/fhir+json"}
