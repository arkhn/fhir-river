package mocks

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func PyrogServer() *httptest.Server {
	pyrogResponse := fmt.Sprintf(`{"data": {"resource": %s}}`, patientMapping)
	mockPyrogServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader == "Bearer validToken" {
			_, _ = fmt.Fprint(w, pyrogResponse)
		} else if authorizationHeader == "Bearer forbiddenToken" {
			http.Error(w, "invalid token", http.StatusForbidden)
		} else {
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}
	}))
	return mockPyrogServer
}
