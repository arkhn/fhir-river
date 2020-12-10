package topics

import "os"

var KafkaURL, isKafkaURL = os.LookupEnv("KAFKA_BOOTSTRAP_SERVERS")

func init() {
	if !isKafkaURL {
		panic("KAFKA_BOOTSTRAP_SERVERS is required in environment")
	}
}
