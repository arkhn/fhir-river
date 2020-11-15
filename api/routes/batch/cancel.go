package batch

import (
	"context"
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

func Cancel(admin *kafka.AdminClient) func (http.ResponseWriter, *http.Request) {
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
