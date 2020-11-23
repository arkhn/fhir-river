package monitor

import (
	"context"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"

	"github.com/arkhn/fhir-river/api/topics"
)

// Destroy deletes a batch by removing its Redis keys and Kafka topics
func (ctl BatchController) Destroy(batchID string) error {
	if _, err := ctl.Rdb.Del("batch:"+batchID+":counter").Result(); err != nil {
		return err
	}
	if _, err := ctl.Rdb.Del("batch:"+batchID+":resources").Result(); err != nil {
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
	if _, err := ctl.KafkaAdmin.DeleteTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60 * time.Second)); err != nil {
		return err
	}
	return nil
}

