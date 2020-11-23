package monitor

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
)

type BatchController struct {
	Rdb        *redis.Client
	KafkaAdmin *kafka.AdminClient
}
