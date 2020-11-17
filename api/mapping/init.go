package mapping

import (
	"fmt"
	"github.com/go-redis/redis"
	"os"
	"strconv"
)

var (
	redisMappingsHost, isRedisMappingsHost = os.LookupEnv("REDIS_MAPPINGS_HOST")
	redisMappingsPort, isRedisMappingsPort = os.LookupEnv("REDIS_MAPPINGS_PORT")
	redisMappingsPassword                  = os.Getenv("REDIS_MAPPINGS_PASSWORD")
	redisMappingsDb, isRedisMappingsDb     = os.LookupEnv("REDIS_MAPPINGS_DB")
	Rdb                                    *redis.Client
	PyrogURL, isPyrogURLDefined            = os.LookupEnv("PYROG_API_URL")
	FhirURL, isFhirURL                     = os.LookupEnv("FHIR_API_URL")
)

func init() {
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
	intRedisMappingsDb, err := strconv.Atoi(redisMappingsDb)
	if err != nil {
		panic("REDIS_MAPPINGS_DB should represent an int")
	}
	Rdb = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisMappingsHost, redisMappingsPort),
		Password: redisMappingsPassword,
		DB:       intRedisMappingsDb,
	})
}
