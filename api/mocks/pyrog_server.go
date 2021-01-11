package mocks

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func PyrogServer() *httptest.Server {
	mockPyrogServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader == "Bearer validToken" {
			pyrogResponse := fmt.Sprintf(`{"data": {"resource": %s}}`, patientMapping)
			_, _ = fmt.Fprint(w, pyrogResponse)
		} else if authorizationHeader == "Bearer forbiddenToken" {
			fmt.Fprint(w, `{"errors": [{"statusCode": 403, "message": "forbidden"}]}`)
		} else if authorizationHeader == "Bearer unauthorizedToken" {
			fmt.Fprint(w, `{"errors": [{"statusCode": 401, "message": "unauthorized"}]}`)
		} else {
			http.Error(w, "invalid token", http.StatusBadRequest)
		}
	}))
	return mockPyrogServer
}
