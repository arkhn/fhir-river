package batch

import (
	"context"
	"github.com/arkhn/fhir-river/api/topics"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
	"time"
)

func Delete(batchID string, rdb *redis.Client, admin *kafka.AdminClient) error {
	if _, err := rdb.Del("batch:"+batchID+":counter").Result(); err != nil {
		return err
	}
	if _, err := rdb.Del("batch:"+batchID+":resources").Result(); err != nil {
		return err
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	batchTopics := []string{
		topics.BatchPrefix + batchID,
		topics.ExtractPrefix + batchID,
		topics.TransformPrefix + batchID,
		topics.LoadPrefix + batchID,
	}
	if _, err := admin.DeleteTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60 * time.Second)); err != nil {
		return err
	}
	return nil
}
