package main

import (
	log "github.com/sirupsen/logrus"
	"os"
)

const (
	consumerGroupID = "api"
)

var (
	port, isPortDefined         = os.LookupEnv("PORT")
	kafkaURL, isKafkaURLDefined = os.LookupEnv("KAFKA_BOOTSTRAP_SERVERS")
	redisHost, isRedisHost      = os.LookupEnv("REDIS_COUNTER_HOST")
	redisPort, isRedisPort      = os.LookupEnv("REDIS_COUNTER_PORT")
	redisPassword               = os.Getenv("REDIS_COUNTER_PASSWORD")
	redisDb, isRedisDb          = os.LookupEnv("REDIS_COUNTER_DB")
)

// ensure that the required environment variables are defined
func init() {
	if !isPortDefined {
		panic("PORT is required in environment")
	}
	if !isKafkaURLDefined {
		panic("KAFKA_BOOTSTRAP_SERVERS is required in environment")
	}
	if !isRedisHost {
		panic("REDIS_COUNTER_HOST is required in environment")
	}
	if !isRedisPort {
		panic("REDIS_COUNTER_PORT is required in environment")
	}
	if !isRedisDb {
		panic("REDIS_COUNTER_DB is required in environment")
	}

	// Use the default text formatter.
	log.SetFormatter(&log.TextFormatter{})

	// Output to stdout instead of the default stderr
	log.SetOutput(os.Stdout)

	// Only log the debug severity or above.
	log.SetLevel(log.DebugLevel)
}
