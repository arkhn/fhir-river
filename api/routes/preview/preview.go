package preview

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/arkhn/fhir-river/api/errors"
	"github.com/arkhn/fhir-river/api/mapping"
	"io/ioutil"
	"net/http"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

// PreviewRequest is the body of the POST /preview request.
type Request struct {
	// PrimaryKeyValues can be a list of strings (eg ["E65"]) or a list of integers ([59])
	PrimaryKeyValues []interface{} `json:"primary_key_values"`
	ResourceID       string        `json:"resource_id"`
	PreviewID        string        `json:"preview_id"`
}

// transform sends an HTTP request to the transformer service
// with the extracted rows and returns its response body.
func transform(resourceID, previewID string, rows []interface{}) (res []byte, err error) {
	jBody, _ := json.Marshal(map[string]interface{}{
		"resource_id": resourceID,
		"preview_id":  previewID,
		"dataframe":   rows,
	})

	url := fmt.Sprintf("%s/transform", transformerURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
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
	default:
		// Return other errors
		return nil, fmt.Errorf(string(body))
	}

	return body, nil
}

// transform sends an HTTP request to the transformer service
// using the PreviewRequest as JSON body. It returns the extrcted rows.
func extract(preview *Request) (rows []interface{}, err error) {
	jBody, _ := json.Marshal(preview)
	url := fmt.Sprintf("%s/extract", extractorURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	switch resp.StatusCode {
	case http.StatusOK:
		// If everything went well, we go on
	default:
		// Return other errors
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		return nil, fmt.Errorf(string(body))
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
func Preview(w http.ResponseWriter, r *http.Request) {
	// decode the request body
	body := Request{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// generate a new preview ID.
	previewUUID, err := uuid.NewRandom()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	body.PreviewID = previewUUID.String()

	log.Infof("Preview request: %+v", body)

	authorizationHeader := r.Header.Get("Authorization")

	// Fetch and store the mappings to use for the preview
	resourceMapping, err := mapping.Fetch(body.ResourceID, authorizationHeader)
	if err != nil {
		switch e := err.(type) {
		case *errors.InvalidTokenError:
			http.Error(w, err.Error(), e.StatusCode)
		default:
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	serializedMapping, err := json.Marshal(resourceMapping)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// cache the mapping in redis
	err = mapping.Store(serializedMapping, body.ResourceID, body.PreviewID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// extract the rows
	rows, err := extract(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// transform rows
	res, err := transform(body.ResourceID, body.PreviewID, rows)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// delete the mapping from redis
	err = mapping.Delete(body.ResourceID, body.PreviewID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// return the response of the transformer service
	_, _ = fmt.Fprint(w, string(res))
}
