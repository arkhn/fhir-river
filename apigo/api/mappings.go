package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

const resourceFromIDQuery = `
fragment entireFilter on Filter {
    id
    sqlColumn {
        id
        table
        column
    }
    relation
    value
}

fragment entireColumn on Column {
    table
    column
    joins {
        tables {
            table
            column
        }
    }
}

fragment entireInput on Input {
    sqlValue {
        ...entireColumn
    }
    script
    conceptMapId
    staticValue
}

fragment entireCondition on Condition {
    action
    sqlValue {
        table
        column
    }
    relation
    value
}

fragment entireInputGroup on InputGroup {
    id
    mergingScript
    inputs {
        ...entireInput
    }
    conditions {
        ...entireCondition
    }
}

fragment a on Attribute {
    path
    definitionId
    inputGroups {
        ...entireInputGroup
    }
}

fragment cred on Credential {
    model
    host
    port
    database
    owner
    login
    password: decryptedPassword
}

query resource($resourceId: ID!) {
    resource(resourceId: $resourceId) {
        id
        primaryKeyTable
        primaryKeyColumn
        definitionId
        definition {
            type
            kind
            derivation
            url
        }
        filters {
            ...entireFilter
        }
        attributes {
            ...a
        }
        source {
            id
            credential {
                ...cred
            }
        }
    }
}`

type graphqlVariables struct {
	ResourceID string `json:"resourceId"`
}

type mappingCredentials struct {
	Model    string `json:"model"`
	Host     string `json:"host"`
	Port     string `json:"port"`
	Database string `json:"database"`
	Owner    string `json:"owner"`
	Login    string `json:"login"`
	Password string `json:"password"`
}

type mappingColumn struct {
	Table  string `json:"table"`
	Column string `json:"column"`
}

type mappingFilter struct {
	ID        string        `json:"id"`
	SqlColumn mappingColumn `json:"sqlColumn"`
	Relation  string        `json:"relation"`
	Value     string        `json:"value"`
}

type mappingAttribute struct {
	Path         string              `json:"path"`
	DefinitionId string              `json:"definitionId"`
	InputGroups  []mappingInputGroup `json:"inputGroups"`
}

type mappingInputGroup struct {
	ID            string             `json:"id"`
	MergingScript string             `json:"mergingScript"`
	Inputs        []mappingInput     `json:"inputs"`
	Conditions    []mappingCondition `json:"conditions"`
}

type mappingInput struct {
	SqlValue struct {
		Table  string `json:"table"`
		Column string `json:"column"`
		Joins  []struct {
			Tables []mappingColumn `json:"tables"`
		} `json:"joins"`
	} `json:"sqlValue"`
	Script          string            `json:"script"`
	ConceptMapID    string            `json:"conceptMapId"`
	ConceptMapTitle string            `json:"conceptMapTitle"`
	ConceptMap      map[string]string `json:"conceptMap"`
	StaticValue     string            `json:"staticValue"`
}

type mappingCondition struct {
	Action   string        `json:"action"`
	SqlValue mappingColumn `json:"sqlValue"`
	Relation string        `json:"relation"`
	Value    string        `json:"value"`
}

type mappingResource struct {
	ID               string `json:"id"`
	PrimaryKeyTable  string `json:"primaryKeyTable"`
	PrimaryKeyColumn string `json:"primaryKeyColumn"`
	DefinitionId     string `json:"definitionId"`
	Definition       struct {
		Type       string `json:"type"`
		Kind       string `json:"kind"`
		Derivation string `json:"derivation"`
		Url        string `json:"url"`
	} `json:"definition"`
	Filters    []mappingFilter    `json:"filters"`
	Attributes []mappingAttribute `json:"attributes"`
	Source     struct {
		ID         string             `json:"id"`
		Credential mappingCredentials `json:"credential"`
	} `json:"source"`
}

type graphqlResponse struct {
	Data struct {
		Resource mappingResource `json:"resource"`
	} `json:"data"`
}

func fetchMapping(resourceID string, authorizationHeader string) (*mappingResource, error) {
	// TODO make a type for the response?
	variables := graphqlVariables{
		ResourceID: resourceID,
	}
	graphqlQueryBody := struct {
		Query     string           `json:"query"`
		Variables graphqlVariables `json:"variables"`
	}{
		Query:     resourceFromIDQuery,
		Variables: variables,
	}
	jBody, _ := json.Marshal(graphqlQueryBody)
	graphqlQuery, err := http.NewRequest("POST", pyrogURL, bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}
	graphqlQuery.Header.Set("Authorization", authorizationHeader)
	graphqlQuery.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(graphqlQuery)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	gqlResp := graphqlResponse{}
	err = json.NewDecoder(resp.Body).Decode(&gqlResp)
	if err != nil {
		return nil, err
	}

	resourceMapping := gqlResp.Data.Resource

	// Dereference concept maps
	err = dereferenceConceptMap(&resourceMapping, authorizationHeader)
	if err != nil {
		return nil, err
	}

	return &resourceMapping, nil
}

func dereferenceConceptMap(mapping *mappingResource, authorizationHeader string) error {
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
	url := fmt.Sprintf("%s/ConceptMap/%s", fhirURL, conceptMapID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", authorizationHeader)
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
		return nil, errors.New("Error while fetching concept map")
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

func storeMapping(mapping []byte, resourceID string, batchID string) error {
	err := rdb.Set(fmt.Sprintf("%s:%s", batchID, resourceID), mapping, 0)
	if err != nil {
		return err.Err()
	}
	return nil
}
