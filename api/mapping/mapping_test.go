package mapping

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/arkhn/fhir-river/api/errors"
	"github.com/arkhn/fhir-river/api/mocks"
)

func TestFetch(t *testing.T) {
	pyrogServer := mocks.PyrogServer()
	defer pyrogServer.Close()
	PyrogURL = pyrogServer.URL

	fhirApi := mocks.FhirAPI()
	defer fhirApi.Close()
	FhirURL = fhirApi.URL

	t.Run("resulting mapping should be correct", func(t *testing.T) {
		mapping, err := Fetch("resourceID", "Bearer validToken")
		assert.NoError(t, err)

		assert.Equal(t, "Patient", mapping.DefinitionId, "Mapping is incorrect")
		assert.Equal(t, "patients", mapping.PrimaryKeyTable, "Mapping is incorrect")
		assert.Equal(t, "row_id", mapping.PrimaryKeyColumn, "Mapping is incorrect")
	})

	t.Run("query pyrog without enough rights", func(t *testing.T) {
		_, err := Fetch("resourceID", "Bearer forbiddenToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*errors.InvalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusForbidden, got.StatusCode, "status code is incorrect")
	})

	t.Run("query pyrog with invalid token", func(t *testing.T) {
		_, err := Fetch("resourceID", "Bearer invalidToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*errors.InvalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusUnauthorized, got.StatusCode, "status code is incorrect")
	})
}

func TestFetchConceptMap(t *testing.T) {
	fhirApi := mocks.FhirAPI()
	defer fhirApi.Close()
	FhirURL = fhirApi.URL

	t.Run("fetched map should be correct", func(t *testing.T) {
		conceptMap, err := fetchConceptMap("mapID", "Bearer validToken")
		assert.NoError(t, err)

		m := make(map[string]string)
		m["F"] = "female"
		m["M"] = "male"
		assert.Equal(t, m, conceptMap, "concept map is incorrect")
	})

	t.Run("query api without enough rights", func(t *testing.T) {
		_, err := fetchConceptMap("resourceID", "Bearer forbiddenToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*errors.InvalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusForbidden, got.StatusCode, "status code is incorrect")
	})

	t.Run("query api with invalid token", func(t *testing.T) {
		_, err := fetchConceptMap("resourceID", "Bearer invalidToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*errors.InvalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusUnauthorized, got.StatusCode, "status code is incorrect")
	})
}

func TestDereferenceConceptMap(t *testing.T) {
	fhirApi := mocks.FhirAPI()
	defer fhirApi.Close()
	FhirURL = fhirApi.URL

	initialMapping := &resource{
		Attributes: []*attribute{{
			InputGroups: []*inputGroup{{
				Inputs: []*input{{
					ConceptMapID: "cm_gender",
				}},
			}},
		}},
	}

	err := dereferenceConceptMap(initialMapping, "Bearer validToken")
	assert.NoError(t, err)

	m := make(map[string]string)
	m["F"] = "female"
	m["M"] = "male"
	assert.Equal(t, m, initialMapping.Attributes[0].InputGroups[0].Inputs[0].ConceptMap, "concept map is incorrect")
}
