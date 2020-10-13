package api

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/go-redis/redis"
)

var (
	PYROG_API_URL           = os.Getenv("PYROG_API_URL")
	REDIS_MAPPINGS_URL      = os.Getenv("REDIS_MAPPINGS_URL")
	REDIS_MAPPINGS_PASSWORD = os.Getenv("REDIS_MAPPINGS_PASSWORD")
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

func fetchMapping(resourceID string, authorizationHeader string) (interface{}, error) {
	// TODO make a type for the response?
	graphqlQuery, err := http.NewRequest("POST", PYROG_API_URL, bytes.NewBuffer([]byte(resourceFromIDQuery)))
	if err != nil {
		return nil, err
	}
	graphqlQuery.Header.Set("Authorization", authorizationHeader)
	graphqlQuery.Header.Set("Content-Type", "application/json")

	response, err := http.DefaultClient.Do(graphqlQuery)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	data, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	// TODO dereference concept maps
	return string(data), nil
}

var rdb = redis.NewClient(&redis.Options{
	Addr:     REDIS_MAPPINGS_URL,
	Password: REDIS_MAPPINGS_PASSWORD,
	DB:       0,
})

func storeMapping(mapping interface{}, resourceID string, batchID string) error {
	err := rdb.Set(fmt.Sprintf("%s:%s", batchID, resourceID), mapping, 0)
	if err != nil {
		return err.Err()
	}
	return nil
}
