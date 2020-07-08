package api

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/julienschmidt/httprouter"
	"github.com/stretchr/testify/assert"
)

func TestPreview(t *testing.T) {

	mockExtractor := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"rows": []}`)
	}))
	defer mockExtractor.Close()
	mockTransformer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{}`)
	}))
	defer mockTransformer.Close()

	transformerURL = mockTransformer.URL
	extractorURL = mockExtractor.URL

	t.Run("accepts primary keys as strings", func(t *testing.T) {
		// use a list of strings in primary_key_values
		b := bytes.NewReader([]byte(`{"resource_id": "1", "primary_key_values": ["1"]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		assert.NoError(t, err)

		// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", Preview)

		// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
		// directly and pass in our Request and ResponseRecorder.
		router.ServeHTTP(rr, req)

		// Check the status code is what we expect.
		assert.Equal(t, http.StatusOK, rr.Code, "bad response status")

		// Check the response body is what we expect.
		assert.Equal(t, `{}`, rr.Body.String(), "bad response body")
	})

	t.Run("accepts primary keys as integers", func(t *testing.T) {
		// use a list of integers in primary_key_values
		b := bytes.NewReader([]byte(`{"resource_id": "1", "primary_key_values": [1]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		assert.NoError(t, err)

		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", Preview)

		router.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "bad response status")

		assert.Equal(t, `{}`, rr.Body.String(), "bad response body")
	})

	t.Run("accepts arbitrary primary keys", func(t *testing.T) {
		// use a list of integers in primary_key_values
		b := bytes.NewReader([]byte(`{"resource_id": "1", "primary_key_values": ["E98"]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		assert.NoError(t, err)

		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", Preview)

		router.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "bad response status")

		assert.Equal(t, `{}`, rr.Body.String(), "bad response body")
	})
}
