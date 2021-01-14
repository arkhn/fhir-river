package batch

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"

	"github.com/arkhn/fhir-river/api/errors"
	"github.com/arkhn/fhir-river/api/mapping"
	"github.com/arkhn/fhir-river/api/topics"
	"github.com/arkhn/fhir-river/api/topics/monitor"
)

// Create is a wrapper around the HTTP handler for the POST /batch route.
// It takes a kafka producer as argument in order to trigger batch events.
func Create(ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var response Response
		producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": topics.KafkaURL})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer producer.Close()

		var request ResourceRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Get authorization header
		authorizationHeader := r.Header.Get("Authorization")

		var resourceIDs []string
		for _, resource := range request.Resources {
			resourceIDs = append(resourceIDs, resource.ID)
		}

		// generate a new batch ID and record the batch and its resource ids in Redis
		batchUUID, err := uuid.NewRandom()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		batchID := batchUUID.String()
		if err := ctl.BatchSet(batchID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if err := ctl.BatchResourcesSet(batchID, resourceIDs); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// create the batch topics in Kafka
		if err = ctl.Topics.Create(batchID); err != nil {
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
		for _, resourceID := range resourceIDs {
			event, _ := json.Marshal(Event{
				BatchID:    batchID,
				ResourceID: resourceID,
			})
			log.WithField("event", string(event)).Info("produce event")
			topicName := ctl.Topics.Batch.GetName(batchID)
			deliveryChan := make(chan kafka.Event)
			err = producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topicName, Partition: kafka.PartitionAny},
				Value:          event,
			}, deliveryChan)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			e := <-deliveryChan
			m := e.(*kafka.Message)
			if m.TopicPartition.Error != nil {
				log.Printf("delivery failed: %v", m.TopicPartition.Error)
				http.Error(w, m.TopicPartition.Error.Error(), http.StatusInternalServerError)
				return
			} else {
				log.Printf("delivered message to topic %s [%d] at offset %v",
					*m.TopicPartition.Topic, m.TopicPartition.Partition, m.TopicPartition.Offset)
			}
			close(deliveryChan)
		}
		response.Id = batchID
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
