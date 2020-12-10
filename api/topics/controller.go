package topics

import "github.com/confluentinc/confluent-kafka-go/kafka"

type TopicController struct {
	Kadmin *kafka.AdminClient
	Batch Topic
	Extract Topic
	Transform Topic
	Load Topic
}

func NewController() TopicController {
	// create Kafka admin client
	kadmin, err := kafka.NewAdminClient(&kafka.ConfigMap{"bootstrap.servers": KafkaURL})
	if err != nil {
		panic(err)
	}
	return TopicController{
		Kadmin: kadmin,
		Batch: New("batch"),
		Extract: New("extract"),
		Transform: New("transform"),
		Load: New("load"),
	}
}
