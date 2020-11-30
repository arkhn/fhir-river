package mapping

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/arkhn/fhir-river/api/errors"
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

type graphqlResponse struct {
	Data struct {
		Resource resource `json:"resource"`
	} `json:"data"`
}

func Fetch(resourceID string, authorizationHeader string) (*resource, error) {
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
	graphqlQuery, err := http.NewRequest("POST", PyrogURL, bytes.NewBuffer(jBody))
	if err != nil {
		return nil, err
	}
	graphqlQuery.Header.Set("Authorization", authorizationHeader)
	graphqlQuery.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(graphqlQuery)
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
		return nil, fmt.Errorf("error while requesting mapping from Pyrog")
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Println(err)
		}
	}()

	gqlResp := graphqlResponse{}
	// TODO: FAIL
	err = json.NewDecoder(resp.Body).Decode(&gqlResp)
	if err != nil {
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}
		bodyString := string(bodyBytes)
		return nil, fmt.Errorf("%s: %v", bodyString, err)
	}

	resourceMapping := gqlResp.Data.Resource

	// Dereference concept maps
	err = dereferenceConceptMap(&resourceMapping, authorizationHeader)
	if err != nil {
		return nil, err
	}

	return &resourceMapping, nil
}
