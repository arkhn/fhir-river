package monitor

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
)

type BatchListener struct {
	Rdb   *redis.Client
	Admin *kafka.AdminClient
	c     *kafka.Consumer
}
