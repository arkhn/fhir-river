package api

import (
	"fmt"
	"os"
	"strconv"

	"github.com/go-redis/redis"
)

var (
	topic                                   = "batch"
	extractorURL, isExtractorURLDefined     = os.LookupEnv("EXTRACTOR_URL")
	transformerURL, isTransformerURLDefined = os.LookupEnv("TRANSFORMER_URL")
	loaderURL, isLoaderURLDefined           = os.LookupEnv("LOADER_URL")
	pyrogURL                                = os.Getenv("PYROG_API_URL")
	fhirURL                                 = os.Getenv("FHIR_API_URL")
	REDIS_MAPPINGS_HOST                     = os.Getenv("REDIS_MAPPINGS_HOST")
	REDIS_MAPPINGS_PORT                     = os.Getenv("REDIS_MAPPINGS_PORT")
	REDIS_MAPPINGS_PASSWORD                 = os.Getenv("REDIS_MAPPINGS_PASSWORD")
	REDIS_MAPPINGS_DB                       = os.Getenv("REDIS_MAPPINGS_DB")
)

var rdb *redis.Client

// ensure that the required environment variables are defined.
// this function is run when this package is imported.
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
