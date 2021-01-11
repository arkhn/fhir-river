package topics

import "github.com/confluentinc/confluent-kafka-go/kafka"

type Controller struct {
	Kadmin    *kafka.AdminClient
	Batch     Topic
	Extract   Topic
	Transform Topic
	Load      Topic
}

func NewController() Controller {
	// create Kafka admin client
	kadmin, err := kafka.NewAdminClient(&kafka.ConfigMap{"bootstrap.servers": KafkaURL})
	if err != nil {
		panic(err)
	}
	return Controller{
		Kadmin:    kadmin,
		Batch:     New("batch"),
		Extract:   New("extract"),
		Transform: New("transform"),
		Load:      New("load"),
	}
}
