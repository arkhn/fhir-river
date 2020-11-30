package mocks

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func FhirAPI() *httptest.Server {
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
			_, _ = fmt.Fprint(w, fhirConceptMap)
		} else if authorizationHeader == "Bearer forbiddenToken" {
			http.Error(w, "invalid token", http.StatusForbidden)
		} else {
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}
	}))

	return mockFhirApi
}
