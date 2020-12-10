package monitor

import (
	"os"
	"strconv"
)

var (
	redisHost, isRedisHost = os.LookupEnv("REDIS_COUNTER_HOST")
	redisPort, isRedisPort = os.LookupEnv("REDIS_COUNTER_PORT")
	redisPassword          = os.Getenv("REDIS_COUNTER_PASSWORD")
	redisDB                int
)

// ensure that the required environment variables are defined
func init() {
	if !isRedisHost {
		panic("REDIS_COUNTER_HOST is required in environment")
	}
	if !isRedisPort {
		panic("REDIS_COUNTER_PORT is required in environment")
	}
	redisDBEnv, isRedisDBEnv := os.LookupEnv("REDIS_COUNTER_DB")
	if !isRedisDBEnv {
		panic("REDIS_COUNTER_DB is required in environment")
	}
	var err error
	redisDB, err = strconv.Atoi(redisDBEnv)
	if err != nil {
		panic("REDIS_COUNTER_DB should represent an int")
	}
}
