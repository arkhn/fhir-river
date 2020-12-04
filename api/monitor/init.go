package monitor

import "os"

const consumerGroupID      = "monitor"

var kafkaURL, isKafkaURLDefined = os.LookupEnv("KAFKA_BOOTSTRAP_SERVERS")

// ensure that the required environment variables are defined
func init() {
	if !isKafkaURLDefined {
		panic("KAFKA_BOOTSTRAP_SERVERS is required in environment")
	}
}
