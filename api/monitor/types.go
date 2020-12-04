package monitor

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
)

type BatchController struct {
<<<<<<< HEAD
	rdb        *redis.Client
	admin *kafka.AdminClient
}

func NewBatchController(rdb *redis.Client, admin *kafka.AdminClient) BatchController {
	return BatchController{rdb, admin}
}

func (ctl BatchController) Redis() *redis.Client {
	return ctl.rdb
}

func (ctl BatchController) Kafka() *kafka.AdminClient {
	return ctl.admin
=======
	rdb   *redis.Client
	kadmin *kafka.AdminClient
}

func NewBatchController(rdb *redis.Client, kadmin *kafka.AdminClient) BatchController {
	return BatchController{rdb, kadmin}
>>>>>>> master
}
