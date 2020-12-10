package topics

import (
	"context"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// Create creates topics in Kafka for the current batch
func (ctl TopicController) Create(batchID string) error {
	batchTopics := []kafka.TopicSpecification{
		{Topic: ctl.Batch.Prefix + batchID, NumPartitions: ctl.Batch.numParts, ReplicationFactor: replicationFactor},
		{Topic: ctl.Extract.Prefix + batchID, NumPartitions: ctl.Extract.numParts, ReplicationFactor: replicationFactor},
		{Topic: ctl.Transform.Prefix + batchID, NumPartitions: ctl.Transform.numParts, ReplicationFactor: replicationFactor},
		{Topic: ctl.Load.Prefix + batchID, NumPartitions: ctl.Load.numParts, ReplicationFactor: replicationFactor},
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	if _, err := ctl.Kadmin.CreateTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60*time.Second)); err != nil {
		return err
	}
	return nil
}
