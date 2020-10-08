package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sync"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	log "github.com/sirupsen/logrus"
)

var (
	topic                                   = "batch"
	extractorURL, isExtractorURLDefined     = os.LookupEnv("EXTRACTOR_URL")
	transformerURL, isTransformerURLDefined = os.LookupEnv("TRANSFORMER_URL")
	loaderURL, isLoaderURLDefined           = os.LookupEnv("LOADER_URL")
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
	BatchID       string   `json:"batch_id"`
	ResourceIDs   []string `json:"resource_ids"`
	Authorization string   `json:"authorization"`
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
func Batch(producer *kafka.Producer) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
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

		// Make all the services fetch the analyses
		// This needs to be synchronous because we don't want a token to become invalid
		// in the middle of a batch
		var wg sync.WaitGroup
		// Status codes channel to check for errors
		chStatusCodes := make(chan int)

		serviceURLs := []string{extractorURL, transformerURL, loaderURL}
		for _, serviceURL := range serviceURLs {
			go func(serviceURL string) {
				wg.Add(1)
				defer wg.Done()
				fetchAnalysisURL := fmt.Sprintf("%s/fetch-analysis", serviceURL)
				jBody, _ := json.Marshal(
					FetchAnalysisRequest{
						BatchID:       batchID,
						ResourceIDs:   resourceIDs,
						Authorization: authorizationHeader,
					},
				)
				resp, err := http.Post(fetchAnalysisURL, "application/json", bytes.NewBuffer(jBody))
				if err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
				}
				chStatusCodes <- resp.StatusCode
			}(serviceURL)
		}
		wg.Wait()
		close(chStatusCodes)

		for statusCode := range chStatusCodes {
			switch statusCode {
			case http.StatusOK:
				// If everything went well, we go on
			case http.StatusUnauthorized:
				http.Error(w, "Token is invalid", http.StatusUnauthorized)
				return
			case http.StatusForbidden:
				http.Error(w, "You don't have rights to perform this action", http.StatusForbidden)
				return
			default:
				// Return other errors
				http.Error(w, "Error while fetching analyses", http.StatusBadRequest)
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
			err = producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          event,
			}, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
			}
		}

		// return the batch ID to the client immediately.
		fmt.Fprint(w, batchID)
	}
}
