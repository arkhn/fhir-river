package monitor

import (
	"fmt"

	"github.com/go-redis/redis"

	"github.com/arkhn/fhir-river/api/topics"
)

type BatchController struct {
	rdb *redis.Client
	topics.Controller
}

func NewBatchController() BatchController {
	// open Redis connection
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password: redisPassword,
		DB:       redisDB,
	})
	return BatchController{
		rdb:        rdb,
		Controller: topics.NewController(),
	}
}
