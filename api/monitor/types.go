package monitor

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
)

type BatchController struct {
	rdb   *redis.Client
	kadmin *kafka.AdminClient
}

func NewBatchController(rdb *redis.Client, kadmin *kafka.AdminClient) BatchController {
	return BatchController{rdb, kadmin}
}
