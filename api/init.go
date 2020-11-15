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
)

// ensure that the required environment variables are defined
func init() {
	if !isPortDefined {
		panic("PORT is required in environment")
	}

	if !isKafkaURLDefined {
		panic("KAFKA_BOOTSTRAP_SERVERS is required in environment")
	}

	// Use the default text formatter.
	log.SetFormatter(&log.TextFormatter{})

	// Output to stdout instead of the default stderr
	log.SetOutput(os.Stdout)

	// Only log the debug severity or above.
	log.SetLevel(log.DebugLevel)
}
