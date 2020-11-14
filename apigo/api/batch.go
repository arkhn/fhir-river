package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"time"
)

// BatchRequest is the body of the POST /batch request.
type BatchRequest struct {
	Resources []struct {
		ID           string `json:"resource_id"`
		ResourceType string `json:"resource_type"`
	} `json:"resources"`
}

// FetchAnalysisRequest is the body of the POST /fetch-analysis request.
type FetchAnalysisRequest struct {
	BatchID     string   `json:"batch_id"`
	ResourceIDs []string `json:"resource_ids"`
}

// DeleteResourceRequest is the body of the POST /delete-resource request.
type DeleteResourceRequest struct {
	Resources []struct {
		ID           string `json:"resource_id"`
		ResourceType string `json:"resource_type"`
	} `json:"resources"`
}

// BatchEvent is the kind of event produced to trigger a batch ETL.
type BatchEvent struct {
	BatchID    string `json:"batch_id"`
	ResourceID string `json:"resource_id"`
}

// Batch is a wrapper around the HTTP handler for the POST /batch route.
// It takes a kafka producer as argument in order to trigger batch events.
func Batch(producer *kafka.Producer, admin *kafka.AdminClient) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// decode the request body
		body := BatchRequest{}
		err := json.NewDecoder(r.Body).Decode(&body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var resourceIDs []string
		for _, resource := range body.Resources {
			resourceIDs = append(resourceIDs, resource.ID)
		}

		// Get authorization header
		authorizationHeader := r.Header.Get("Authorization")

		// generate a new batch ID.
		batchUUID, err := uuid.NewRandom()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		batchID := batchUUID.String()

		// create batchID topic
		batchTopics := []kafka.TopicSpecification{
			{Topic: batchTopicPrefix + batchID, NumPartitions: numTopicPartitions},
			{Topic: extractTopicPrefix + batchID, NumPartitions: numTopicPartitions},
			{Topic: transformTopicPrefix + batchID, NumPartitions: numTopicPartitions},
			{Topic: loadTopicPrefix + batchID, NumPartitions: numTopicPartitions},
		}
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if _, err = admin.CreateTopics(ctx, batchTopics); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Fetch and store the mappings to use for the batch
		// This needs to be synchronous because we don't want a token to become invalid
		// in the middle of a batch
		for _, resourceID := range resourceIDs {
			resourceMapping, err := fetchMapping(resourceID, authorizationHeader)
			if err != nil {
				switch e := err.(type) {
				case *invalidTokenError:
					http.Error(w, err.Error(), e.statusCode)
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

			err = storeMapping(serializedMapping, resourceID, batchID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		}

		// delete all the documents correspondng to the batch resources
		deleteUrl := fmt.Sprintf("%s/delete-resources", loaderURL)
		jBody, _ := json.Marshal(DeleteResourceRequest{Resources: body.Resources})
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
		for _, resource := range body.Resources {
			resourceID := resource.ID
			event, _ := json.Marshal(BatchEvent{
				BatchID:    batchID,
				ResourceID: resourceID,
			})
			log.WithField("event", string(event)).Info("produce event")
			topicName := batchTopicPrefix + batchID
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

func CancelBatch(admin *kafka.AdminClient) func (http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		batchID := vars["id"]
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		batchTopics := []string{
			batchTopicPrefix + batchID,
			extractTopicPrefix + batchID,
			transformTopicPrefix + batchID,
			loadTopicPrefix + batchID,
		}
		if _, err := admin.DeleteTopics(ctx, batchTopics); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// return the batch ID to the client immediately.
		_, _ = fmt.Fprint(w, batchID)
	}
}
