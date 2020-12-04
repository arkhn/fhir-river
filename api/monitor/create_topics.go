package monitor

import (
	"context"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"

	"github.com/arkhn/fhir-river/api/topics"
)

// CreateTopics creates topics in Kafka for the current batch
func (ctl BatchController) CreateTopics(batchID string) error {
	batchTopics := []kafka.TopicSpecification{
		{Topic: topics.BatchPrefix + batchID, NumPartitions: topics.NumParts, ReplicationFactor: topics.ReplicationFactor},
		{Topic: topics.ExtractPrefix + batchID, NumPartitions: topics.NumParts, ReplicationFactor: topics.ReplicationFactor},
		{Topic: topics.TransformPrefix + batchID, NumPartitions: topics.NumParts, ReplicationFactor: topics.ReplicationFactor},
		{Topic: topics.LoadPrefix + batchID, NumPartitions: topics.NumParts, ReplicationFactor: topics.ReplicationFactor},
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	if _, err := ctl.kadmin.CreateTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60*time.Second)); err != nil {
		return err
	}
	return nil
}
