package api

import (
	"fmt"
	"strconv"

	"github.com/go-redis/redis"
)

// ensure that the required environment variables are defined.
// this function is run when this package is imported.
var rdb *redis.Client

func init() {
	if !isExtractorURLDefined {
		panic("EXTRACTOR_URL is required in environment")
	}

	if !isTransformerURLDefined {
		panic("TRANSFORMER_URL is required in environment")
	}

	INT_REDIS_MAPPINGS_DB, err := strconv.Atoi(REDIS_MAPPINGS_DB)
	if err != nil {
		panic("env var REDIS_MAPPINGS_DB should represent an int")
	}
	rdb = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", REDIS_MAPPINGS_HOST, REDIS_MAPPINGS_PORT),
		Password: REDIS_MAPPINGS_PASSWORD,
		DB:       INT_REDIS_MAPPINGS_DB,
	})

}
