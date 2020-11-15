package mapping

import (
	"encoding/json"
	"fmt"
	"github.com/arkhn/fhir-river/api/errors"
	"net/http"
)

type conceptMapResponse struct {
	Group []struct {
		Element []struct {
			Code   string `json:"code"`
			Target []struct {
				Equivalence string `json:"equivalence"`
				Code        string `json:"code"`
			} `json:"target"`
		} `json:"element"`
	} `json:"group"`
}

func fetchConceptMap(conceptMapID string, authorizationHeader string) (map[string]string, error) {
	url := fmt.Sprintf("%s/ConceptMap/%s", FhirURL, conceptMapID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", authorizationHeader)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	switch resp.StatusCode {
	case http.StatusOK:
		// If everything went well, we go on
	case http.StatusUnauthorized:
		return nil, &errors.InvalidTokenError{Message: "Token is invalid", StatusCode: http.StatusUnauthorized}
	case http.StatusForbidden:
		return nil, &errors.InvalidTokenError{
			Message: "You don't have rights to perform this action",
			StatusCode: http.StatusForbidden,
		}
	default:
		// Return other errors
		return nil, fmt.Errorf("error while fetching concept map")
	}

	conceptMapResp := conceptMapResponse{}
	err = json.NewDecoder(resp.Body).Decode(&conceptMapResp)
	if err != nil {
		return nil, err
	}

	// Turn the concept map into a map
	conceptMap := make(map[string]string)
	for _, group := range conceptMapResp.Group {
		for _, element := range group.Element {
			// NOTE we only handle a single target for each source
			sourceCode := element.Code
			targetCode := element.Target[0].Code
			conceptMap[sourceCode] = targetCode
		}
	}

	return conceptMap, nil
}

func dereferenceConceptMap(mapping *resource, authorizationHeader string) error {
	for _, attribute := range mapping.Attributes {
		for _, inputGroup := range attribute.InputGroups {
			for _, input := range inputGroup.Inputs {
				if input.ConceptMapID != "" {
					conceptMap, err := fetchConceptMap(input.ConceptMapID, authorizationHeader)
					if err != nil {
						return err
					}
					input.ConceptMap = conceptMap
				}
			}
		}
	}
	return nil
}
