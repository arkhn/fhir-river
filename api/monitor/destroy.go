package monitor

import (
	"context"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"

	"github.com/arkhn/fhir-river/api/topics"
)

const counterExpiration = "336h"

// Destroy deletes a batch by removing its Redis keys and Kafka topics
func (ctl BatchController) Destroy(batchID string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	batchTopics := []string{
		topics.BatchPrefix + batchID,
		topics.ExtractPrefix + batchID,
		topics.TransformPrefix + batchID,
		topics.LoadPrefix + batchID,
	}
	if _, err := ctl.kadmin.DeleteTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60 * time.Second)); err != nil {
		return err
	}
	twoWeeks, err := time.ParseDuration(counterExpiration)
	if err != nil {
		return err
	}
	if _, err := ctl.rdb.Expire("batch:"+batchID+":counter", twoWeeks).Result(); err != nil {
		return err
	}
	if _, err := ctl.rdb.Del("batch:"+batchID+":resources").Result(); err != nil {
		return err
	}
	log.Println("batch:"+batchID+" destroyed")
	return nil
}
