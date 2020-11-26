package api

import (
	"fmt"
	"os"
	"strconv"

	"github.com/go-redis/redis"
)

var (
	topic                                          = "batch"
	extractorURL, isExtractorURLDefined            = os.LookupEnv("EXTRACTOR_URL")
	transformerURL, isTransformerURLDefined        = os.LookupEnv("TRANSFORMER_URL")
	loaderURL, isLoaderURLDefined                  = os.LookupEnv("LOADER_URL")
	pyrogURL, isPyrogURLDefined                    = os.LookupEnv("PYROG_API_URL")
	fhirURL, isFhirURL                             = os.LookupEnv("FHIR_API_URL")
	redisMappingsHost, isRedisMappingsHost         = os.LookupEnv("REDIS_MAPPINGS_HOST")
	redisMappingsPort, isRedisMappingsPort         = os.LookupEnv("REDIS_MAPPINGS_PORT")
	redisMappingsPassword, isRedisMappingsPassword = os.LookupEnv("REDIS_MAPPINGS_PASSWORD")
	redisMappingsDb, isRedisMappingsDb             = os.LookupEnv("REDIS_MAPPINGS_DB")
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
	if !isLoaderURLDefined {
		panic("LOADER_URL is required in environment")
	}
	if !isPyrogURLDefined {
		panic("PYROG_API_URL is required in environment")
	}
	if !isFhirURL {
		panic("FHIR_API_URL is required in environment")
	}
	if !isRedisMappingsHost {
		panic("REDIS_MAPPINGS_HOST is required in environment")
	}
	if !isRedisMappingsPort {
		panic("REDIS_MAPPINGS_PORT is required in environment")
	}
	if !isRedisMappingsDb {
		panic("REDIS_MAPPINGS_DB is required in environment")
	}

	INT_REDIS_MAPPINGS_DB, err := strconv.Atoi(redisMappingsDb)
	if err != nil {
		panic("env var REDIS_MAPPINGS_DB should represent an int")
	}
	rdb = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisMappingsHost, redisMappingsPort),
		Password: redisMappingsPassword,
		DB:       INT_REDIS_MAPPINGS_DB,
	})
}
