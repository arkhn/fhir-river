package monitor

import (
	"encoding/json"
	"github.com/arkhn/fhir-river/api/routes/batch"
	"github.com/arkhn/fhir-river/api/topics"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
)

type message struct {
	BatchID    string `json:"batch_id"`
	ResourceID string `json:"resource_id"`
}

func isEndOfBatch(msg message, rdb *redis.Client) (bool, error) {
	batchResources, err := rdb.SMembers("batch:"+msg.BatchID+":resources").Result()
	if err != nil {
		return false, err
	}
	counter, err := rdb.HGetAll("batch:"+msg.BatchID+":counter").Result()
	if err != nil {
		return false, err
	}
	for _, resource := range batchResources {
		extractCountStr, isExtracting := counter["resource:"+resource+":extracted"]
		if !isExtracting {
			return false, nil
		}
		extractCountInt, err := strconv.ParseInt(extractCountStr, 10, 32)
		if err != nil {
			return false, err
		}
		if extractCountInt == 0 {
			continue
		}
		loadCountStr, isLoading := counter["resource:"+resource+":loaded"]
		if !isLoading {
			return false, nil
		}
		loadCountInt, err := strconv.ParseInt(loadCountStr, 10, 32)
		if err != nil {
			return false, err
		}
		if extractCountInt < loadCountInt {
			return false, nil
		}
	}
	return true, nil
}

// Loading consumes load.* topics. Each time a new resource instance is loaded,
// it increments the batch_id counter of the resource type resource_id in Redis.
// A batch counter is a Redis hash of key "batch:{batch_id}:counter" containing elements of keys
// "resource:{resource_id}:extracted" and "resource:{resource_id}:loaded".
// "resource:{resource_id}:extracted" refers to the number of resources of type {resource_id} extracted.
// "resource:{resource_id}:loaded" refers to the number of loaded resources of type {resource_id}.
// The list of resource types of a batch is in a Redis set "batch:{batch_id}:resources"
func Loading(rdb *redis.Client, admin *kafka.AdminClient) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":   kafkaURL,
		"group.id":            consumerGroupID,
		"session.timeout.ms":  6000,
		"metadata.max.age.ms": 5000,
		"auto.offset.reset":   "earliest"})
	if err != nil {
		panic(err)
	}
	defer func() {
		log.Println("Closing consumer")
		if err := c.Close(); err != nil {
			panic(err)
		}
	}()
	if err = c.Subscribe(topics.Load, nil); err != nil {
		panic(err)
	}

	s := make(chan os.Signal, 1)
	signal.Notify(s, syscall.SIGTERM, syscall.SIGINT)

	ConsumerLoop:
	for {
		select {
		case sig := <-s:
			log.Printf("Caught signal %v: terminating\n", sig)
			break ConsumerLoop
		default:
			ev := c.Poll(1000)
			if ev == nil {
				continue
			}
			switch e := ev.(type) {
			case *kafka.Message:
				var msg message
				if err := json.Unmarshal(e.Value, &msg); err != nil {
					log.Printf("Error while decoding Kafka message: %v\n", err)
					continue
				}
				// Increment counter in Redis
				rdb.HIncrBy("batch:"+msg.BatchID+":counter", "resource:"+msg.ResourceID+":loaded", 1)
				eob, err := isEndOfBatch(msg, rdb)
				if err != nil {
					log.Println(err)
					continue
				}
				if eob {
					if err := batch.Delete(msg.BatchID, rdb, admin); err != nil {
						log.Println(err)
						continue
					}
				}
			case kafka.Error:
				log.Printf("%% Error: %v: %v\n", e.Code(), e)
			default:
				log.Printf("Ignored %v\n\n", e)
			}
		}
	}
}
