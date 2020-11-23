package batch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/arkhn/fhir-river/api/monitor"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"

	"github.com/arkhn/fhir-river/api/errors"
	"github.com/arkhn/fhir-river/api/mapping"
	"github.com/arkhn/fhir-river/api/topics"
)

// Create is a wrapper around the HTTP handler for the POST /batch route.
// It takes a kafka producer as argument in order to trigger batch events.
func Create(producer *kafka.Producer, ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var request ResourceRequest
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Get authorization header
		authorizationHeader := r.Header.Get("Authorization")

		var resourceIDs []string
		for _, resource := range request.Resources {
			resourceIDs = append(resourceIDs, resource.ID)
		}

		// generate a new batch ID.
		batchUUID, err := uuid.NewRandom()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		batchID := batchUUID.String()

		// List resources of current batch in Redis
		if err := ctl.Rdb.SAdd("batch:"+batchID+":resources", resourceIDs).Err(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// create batchID topics
		batchTopics := []kafka.TopicSpecification{
			{Topic: topics.BatchPrefix + batchID, NumPartitions: topics.NumParts},
			{Topic: topics.ExtractPrefix + batchID, NumPartitions: topics.NumParts},
			{Topic: topics.TransformPrefix + batchID, NumPartitions: topics.NumParts},
			{Topic: topics.LoadPrefix + batchID, NumPartitions: topics.NumParts},
		}
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()
		if _, err = ctl.KafkaAdmin.CreateTopics(ctx, batchTopics, kafka.SetAdminOperationTimeout(60 * time.Second)); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Fetch and store the mappings to use for the batch
		// This needs to be synchronous because we don't want a token to become invalid
		// in the middle of a batch
		for _, resourceID := range resourceIDs {
			resourceMapping, err := mapping.Fetch(resourceID, authorizationHeader)
			if err != nil {
				switch e := err.(type) {
				case *errors.InvalidTokenError:
					http.Error(w, err.Error(), e.StatusCode)
				default:
					http.Error(w, err.Error(), http.StatusBadRequest)
				}
				return
			}

			serializedMapping, err := json.Marshal(resourceMapping)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			err = mapping.Store(serializedMapping, resourceID, batchID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		}

		// delete all the documents correspondng to the batch resources
		deleteUrl := fmt.Sprintf("%s/delete-resources", loaderURL)
		jBody, _ := json.Marshal(DeleteResourceRequest{Resources: request.Resources})
		resp, err := http.Post(deleteUrl, "application/json", bytes.NewBuffer(jBody))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if resp.StatusCode != 200 {
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, string(body), http.StatusBadRequest)
			return
		}

		// produce a "batch" kafka event for each resource ID.
		for _, resource := range request.Resources {
			resourceID := resource.ID
			event, _ := json.Marshal(Event{
				BatchID:    batchID,
				ResourceID: resourceID,
			})
			log.WithField("event", string(event)).Info("produce event")
			topicName := topics.BatchPrefix + batchID
			err = producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topicName, Partition: kafka.PartitionAny},
				Value:          event,
			}, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
			}
		}
		// return the batch ID to the client immediately.
		_, _ = fmt.Fprint(w, batchID)
	}
}
