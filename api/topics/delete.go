package topics

import (
	"context"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func (ctl TopicController) Delete(batchID string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	batchTopics := []string{
		ctl.Batch.Prefix + batchID,
		ctl.Extract.Prefix + batchID,
		ctl.Transform.Prefix + batchID,
		ctl.Load.Prefix + batchID,
	}
	if _, err := ctl.Kadmin.DeleteTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60*time.Second)); err != nil {
		return err
	}
	return nil
}
