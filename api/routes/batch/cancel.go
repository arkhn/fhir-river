package batch

import (
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
	"github.com/gorilla/mux"
	"net/http"
)

func Cancel(rdb *redis.Client, admin *kafka.AdminClient) func (http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		batchID := vars["id"]
		if err := Delete(batchID, rdb, admin); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		// return the batch ID to the client immediately.
		_, _ = fmt.Fprint(w, batchID)
	}
}
