package mapping

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/arkhn/fhir-river/api/errors"
)

const resourceFromIDQuery = `
fragment entireColumn on Column {
	owner {
		name
	}
	table
    column
    joins {
		tables {
			owner {
				name
			}
			table
            column
        }
    }
}

fragment entireFilter on Filter {
	id
	sqlColumn {
		...entireColumn
	}
	relation
	value
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
        ...entireColumn
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
    login
    password: decryptedPassword
}

query resource($resourceId: String!) {
    resource(where: {id: $resourceId}) {
        id
        primaryKeyOwner {
			name
		}
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
	Data *struct {
		Resource resource `json:"resource"`
	} `json:"data"`
	Errors []struct {
		Message    string `json:"message"`
		StatusCode int    `json:"statusCode"`
	} `json:"errors"`
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
	err = json.NewDecoder(resp.Body).Decode(&gqlResp)
	if err != nil {
		return nil, err
	}

	// grqphql errors are retured as http.StatusOK but contains an "error"
	if gqlResp.Errors != nil {
		switch gqlResp.Errors[0].StatusCode {
		case http.StatusUnauthorized:
			return nil, &errors.InvalidTokenError{Message: "Token is invalid", StatusCode: http.StatusUnauthorized}
		case http.StatusForbidden:
			return nil, &errors.InvalidTokenError{
				Message:    "You don't have rights to perform this action",
				StatusCode: http.StatusForbidden,
			}
		default:
			return nil, fmt.Errorf(gqlResp.Errors[0].Message)
		}
	}
	resourceMapping := gqlResp.Data.Resource

	// Dereference concept maps
	err = dereferenceConceptMap(&resourceMapping, authorizationHeader)
	if err != nil {
		return nil, err
	}

	return &resourceMapping, nil
}
