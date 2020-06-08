package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	log "github.com/sirupsen/logrus"
)

var (
	topic = "batch"
)

// BatchRequest is the body of the POST /batch request.
type BatchRequest struct {
	ResourceIDs []string `json:"resource_ids"`
}

// BatchEvent is the kind of event produced to trigger a batch ETL.
type BatchEvent struct {
	BatchID    string `json:"batch_id"`
	ResourceID string `json:"resource_id"`
}

// Batch is a wrapper around the HTTP handler for the POST /batch route.
// It takes a kafka producer as argument in order to trigger batch events.
func Batch(producer *kafka.Producer) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		// decode the request body
		body := BatchRequest{}
		err := json.NewDecoder(r.Body).Decode(&body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// generate a new batch ID.
		batchID, err := uuid.NewRandom()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// produce a "batch" kafka event for each resource ID.
		for _, resourceID := range body.ResourceIDs {
			event, _ := json.Marshal(BatchEvent{
				BatchID:    batchID.String(),
				ResourceID: resourceID,
			})
			log.WithField("event", string(event)).Info("produce event")
			err = producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          event,
			}, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
			}
		}

		// return the batch ID to the client immediately.
		fmt.Fprint(w, batchID.String())
	}
}
