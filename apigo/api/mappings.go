package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

var (
	PYROG_API_URL           = os.Getenv("PYROG_API_URL")
	REDIS_MAPPINGS_HOST     = os.Getenv("REDIS_MAPPINGS_HOST")
	REDIS_MAPPINGS_PORT     = os.Getenv("REDIS_MAPPINGS_PORT")
	REDIS_MAPPINGS_PASSWORD = os.Getenv("REDIS_MAPPINGS_PASSWORD")
	REDIS_MAPPINGS_DB       = os.Getenv("REDIS_MAPPINGS_DB")
)

const attrFragment = `
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
}`

const credFragment = `
fragment cred on Credential {
    model
    host
    port
    database
    owner
    login
    password: decryptedPassword
}
`

var resourceFromIDQuery = fmt.Sprintf(`
%s

%s

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
}
`, attrFragment, credFragment)

type graphqlVariables struct {
	ResourceID string `json:"resourceId"`
}

func fetchMapping(resourceID string, authorizationHeader string) (string, error) {
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
	graphqlQuery, err := http.NewRequest("POST", PYROG_API_URL, bytes.NewBuffer(jBody))
	if err != nil {
		return "", err
	}
	graphqlQuery.Header.Set("Authorization", authorizationHeader)
	graphqlQuery.Header.Set("Content-Type", "application/json")

	response, err := http.DefaultClient.Do(graphqlQuery)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	data, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	// TODO dereference concept maps
	return string(data), nil
}

func storeMapping(mapping string, resourceID string, batchID string) error {
	err := rdb.Set(fmt.Sprintf("%s:%s", batchID, resourceID), mapping, 0)
	if err != nil {
		return err.Err()
	}
	return nil
}
