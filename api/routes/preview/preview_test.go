package preview

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/alicebob/miniredis"
	"github.com/go-redis/redis"
	"github.com/julienschmidt/httprouter"
	"github.com/stretchr/testify/assert"

	"github.com/arkhn/fhir-river/api/mapping"
	"github.com/arkhn/fhir-river/api/mocks"
)

func newTestRedis() (*miniredis.Miniredis, *redis.Client) {
	mr, err := miniredis.Run()
	if err != nil {
		panic(err)
	}
	return mr, redis.NewClient(&redis.Options{
		Addr: mr.Addr(),
	})
}

func PreviewHandle(writer http.ResponseWriter, request *http.Request, _ httprouter.Params) {
	Run(writer, request)
}

func TestPreview(t *testing.T) {

	mockExtractor := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = fmt.Fprint(w, `{"rows": []}`)
	}))
	defer mockExtractor.Close()
	mockTransformer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = fmt.Fprint(w, `{}`)
	}))
	defer mockTransformer.Close()

	transformerURL = mockTransformer.URL
	extractorURL = mockExtractor.URL

	var mockRedis *miniredis.Miniredis
	mockRedis, mapping.Rdb = newTestRedis()
	defer mockRedis.Close()

	mockfhirAPI := mocks.FhirAPI()
	defer mockfhirAPI.Close()
	mapping.FhirURL = mockfhirAPI.URL

	mockPyrog := mocks.PyrogServer()
	mapping.PyrogURL = mockPyrog.URL
	defer mockPyrog.Close()

	t.Run("accepts primary keys as strings", func(t *testing.T) {
		// use a list of strings in primary_key_values
		b := bytes.NewReader([]byte(`{"resource_id": "1", "preview_id": "u-u-i-d", "primary_key_values": ["1"]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		if err != nil {
			panic(err)
		}
		req.Header.Add("Authorization", "Bearer validToken")
		assert.NoError(t, err)

		// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", PreviewHandle)

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
		b := bytes.NewReader([]byte(`{"resource_id": "1", "preview_id": "u-u-i-d", "primary_key_values": [1]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		if err != nil {
			panic(err)
		}
		req.Header.Add("Authorization", "Bearer validToken")
		assert.NoError(t, err)

		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", PreviewHandle)

		router.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "bad response status")

		assert.Equal(t, `{}`, rr.Body.String(), "bad response body")
	})

	t.Run("accepts arbitrary primary keys", func(t *testing.T) {
		// use a list of integers in primary_key_values
		b := bytes.NewReader([]byte(`{"resource_id": "1", "preview_id": "u-u-i-d", "primary_key_values": ["E98"]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		if err != nil {
			panic(err)
		}
		req.Header.Add("Authorization", "Bearer validToken")
		assert.NoError(t, err)

		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", PreviewHandle)

		router.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "bad response status")

		assert.Equal(t, `{}`, rr.Body.String(), "bad response body")
	})

	t.Run("returns an error if unauthorized auth token", func(t *testing.T) {
		// use a list of strings in primary_key_values
		b := bytes.NewReader([]byte(`{"resource_id": "1", "preview_id": "u-u-i-d", "primary_key_values": ["1"]}`))
		req, err := http.NewRequest("POST", "/preview", b)
		req.Header.Add("Authorization", "Bearer unauthorizedToken")
		assert.NoError(t, err)

		// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
		rr := httptest.NewRecorder()
		router := httprouter.New()
		router.POST("/preview", PreviewHandle)

		// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
		// directly and pass in our Request and ResponseRecorder.
		router.ServeHTTP(rr, req)

		// Check the status code is what we expect.
		assert.Equal(t, http.StatusUnauthorized, rr.Code, "bad response status")

		// Check the response body is what we expect.
		assert.Equal(t, "Token is invalid\n", rr.Body.String(), "bad response body")
	})
}
