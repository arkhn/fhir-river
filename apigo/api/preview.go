package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"
	log "github.com/sirupsen/logrus"
)

var (
	transformerURL, isTransformerURLDefined = os.LookupEnv("TRANSFORMER_URL")
	extractorURL, isExtractorURLDefined     = os.LookupEnv("EXTRACTOR_URL")
)

// ensure that the required environment variables are defined.
// this function is run when this package is imported.
func init() {
	if !isExtractorURLDefined {
		panic("EXTRACTOR_URL is required in environment")
	}

	if !isTransformerURLDefined {
		panic("TRANSFORMER_URL is required in environment")
	}
}

// PreviewRequest is the body of the POST /preview request.
type PreviewRequest struct {
	ResourceID       string        `json:"resource_id"`
	PrimaryKeyValues []json.Number `json:"primary_key_values"`
}

// transform sends an HTTP request to the transformer service
// with the extracted rows and returns its response body.
func transform(resourceID string, rows []interface{}) (res []byte, err error) {
	jBody, _ := json.Marshal(map[string]interface{}{
		"resource_id": resourceID,
		"dataframe":   rows,
	})

	url := fmt.Sprintf("%s/transform", transformerURL)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}

	return ioutil.ReadAll(resp.Body)
}

// transform sends an HTTP request to the transformer service
// using the PreviewRequest as JSON body. It returns the extrcted rows.
func extract(req *PreviewRequest) (rows []interface{}, err error) {
	jBody, _ := json.Marshal(req)
	url := fmt.Sprintf("%s/extract", extractorURL)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}

	body := struct {
		Rows []interface{}
	}{}
	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	return body.Rows, nil
}

// Preview is the HTTP handler for the POST /preview route.
// It calls both the extractor and the transformer service to preview
// the FHIR transformation of a set of rows for a given resource.
func Preview(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// decode the request body
	body := PreviewRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Infof("Preview request: %+v", body)

	// extract the rows
	rows, err := extract(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// transform rows
	res, err := transform(body.ResourceID, rows)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// return the response of the transformer service
	fmt.Fprint(w, string(res))
}
