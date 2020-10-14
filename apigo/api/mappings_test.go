package api

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func mockFhirAPI() *httptest.Server {
	fhirConceptMap := `{
		"id": "cm_gender",
		"group": [{"element": [
			{"code": "F", "target": [{"code": "female", "equivalence": "equal"}]},
			{"code": "M", "target": [{"code": "male", "equivalence": "equal"}]}
		]}]
	}`
	mockFhirApi := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader == "Bearer validToken" {
			fmt.Fprint(w, fhirConceptMap)
		} else if authorizationHeader == "Bearer forbiddenToken" {
			http.Error(w, "invalid token", http.StatusForbidden)
		} else {
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}
	}))

	return mockFhirApi
}
func mockPyrogServer() *httptest.Server {
	mappingBytes, _ := ioutil.ReadFile("../../analyzer/test/fixtures/patient_mapping.json")

	pyrogResponse := fmt.Sprintf(`{"data": {"resource": %s}}`, string(mappingBytes))
	mockPyrogServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader == "Bearer validToken" {
			fmt.Fprint(w, pyrogResponse)
		} else if authorizationHeader == "Bearer forbiddenToken" {
			http.Error(w, "invalid token", http.StatusForbidden)
		} else {
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}
	}))
	return mockPyrogServer
}

func TestFetchMapping(t *testing.T) {
	pyrogServer := mockPyrogServer()
	defer pyrogServer.Close()
	pyrogURL = pyrogServer.URL

	fhirApi := mockFhirAPI()
	defer fhirApi.Close()
	fhirURL = fhirApi.URL

	t.Run("resulting mapping should be correct", func(t *testing.T) {
		mapping, err := fetchMapping("resourceID", "Bearer validToken")
		assert.NoError(t, err)

		assert.Equal(t, "Patient", mapping.DefinitionId, "Mapping is incorrect")
		assert.Equal(t, "patients", mapping.PrimaryKeyTable, "Mapping is incorrect")
		assert.Equal(t, "row_id", mapping.PrimaryKeyColumn, "Mapping is incorrect")
	})

	t.Run("query pyrog without enough rights", func(t *testing.T) {
		_, err := fetchMapping("resourceID", "Bearer forbiddenToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*invalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusForbidden, got.statusCode, "status code is incorrect")
	})

	t.Run("query pyrog with invalid token", func(t *testing.T) {
		_, err := fetchMapping("resourceID", "Bearer invalidToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*invalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusUnauthorized, got.statusCode, "status code is incorrect")
	})
}

func TestFetchConceptMap(t *testing.T) {
	fhirApi := mockFhirAPI()
	defer fhirApi.Close()
	fhirURL = fhirApi.URL

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

		got, isInvalidTokenError := err.(*invalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusForbidden, got.statusCode, "status code is incorrect")
	})

	t.Run("query api with invalid token", func(t *testing.T) {
		_, err := fetchConceptMap("resourceID", "Bearer invalidToken")
		assert.Error(t, err)

		got, isInvalidTokenError := err.(*invalidTokenError)
		if !isInvalidTokenError {
			t.Fatalf("expected an isInvalidTokenError, got %v", err)
		}
		assert.Equal(t, http.StatusUnauthorized, got.statusCode, "status code is incorrect")
	})
}

func TestDereferenceConceptMap(t *testing.T) {
	fhirApi := mockFhirAPI()
	defer fhirApi.Close()
	fhirURL = fhirApi.URL

	initialMapping := &mappingResource{
		Attributes: []*mappingAttribute{&mappingAttribute{
			InputGroups: []*mappingInputGroup{&mappingInputGroup{
				Inputs: []*mappingInput{&mappingInput{
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
