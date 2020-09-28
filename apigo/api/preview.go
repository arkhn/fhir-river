package api

import (
	"bytes"
	"encoding/json"
	"errors"
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
	// PrimaryKeyValues can be a list of strings (eg ["E65"]) or a list of integers ([59])
	PrimaryKeyValues []interface{} `json:"primary_key_values"`
	ResourceID       string        `json:"resource_id"`
}

// transform sends an HTTP request to the transformer service
// with the extracted rows and returns its response body.
func transform(resourceID string, rows []interface{}, authorizationHeader string, idToken string) (res []byte, err error) {
	jBody, _ := json.Marshal(map[string]interface{}{
		"resource_id": resourceID,
		"dataframe":   rows,
	})

	url := fmt.Sprintf("%s/transform", transformerURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}
	if authorizationHeader != "" {
		req.Header.Set("Authorization", authorizationHeader)
	}
	if idToken != "" {
		req.Header.Set("IdToken", idToken)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	switch resp.StatusCode {
	case 200:
		// If everything went well, we go on
	case 401:
		return nil, &invalidTokenError{message: "Token is invalid", statusCode: 401}
	case 403:
		return nil, &invalidTokenError{message: "You don't have rights to perform this action", statusCode: 403}
	default:
		// Return other errors
		return nil, errors.New(string(body))
	}

	return body, nil
}

// transform sends an HTTP request to the transformer service
// using the PreviewRequest as JSON body. It returns the extrcted rows.
func extract(preview *PreviewRequest, authorizationHeader string, idToken string) (rows []interface{}, err error) {
	jBody, _ := json.Marshal(preview)
	url := fmt.Sprintf("%s/extract", extractorURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}
	if authorizationHeader != "" {
		req.Header.Set("Authorization", authorizationHeader)
	}
	if idToken != "" {
		req.Header.Set("IdToken", idToken)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	switch resp.StatusCode {
	case 200:
		// If everything went well, we go on
	case 401:
		return nil, &invalidTokenError{message: "Token is invalid", statusCode: 401}
	case 403:
		return nil, &invalidTokenError{message: "You don't have rights to perform this action", statusCode: 403}
	default:
		// Return other errors
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		return nil, errors.New(string(body))
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

	authorizationHeader := r.Header.Get("Authorization")
	idToken := r.Header.Get("IdToken")

	// extract the rows
	rows, err := extract(&body, authorizationHeader, idToken)
	if err != nil {
		switch e := err.(type) {
		case *invalidTokenError:
			http.Error(w, err.Error(), e.statusCode)
		default:
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// transform rows
	res, err := transform(body.ResourceID, rows, authorizationHeader, idToken)
	if err != nil {
		switch e := err.(type) {
		case *invalidTokenError:
			http.Error(w, err.Error(), e.statusCode)
		default:
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// return the response of the transformer service
	fmt.Fprint(w, string(res))
}
