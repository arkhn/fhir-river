package topics

import (
	"context"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func (ctl Controller) Delete(batchID string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	batchTopics := []string{
		ctl.Batch.GetName(batchID),
		ctl.Extract.GetName(batchID),
		ctl.Transform.GetName(batchID),
		ctl.Load.GetName(batchID),
	}
	_, err := ctl.Kadmin.DeleteTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60*time.Second))
       return err
}
