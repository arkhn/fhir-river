package monitor

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/confluentinc/confluent-kafka-go/kafka"

	"github.com/arkhn/fhir-river/api/topics"
)

type message struct {
	BatchID string `json:"batch_id"`
}

func (ctl BatchController) isEndOfBatch(batchID string) (bool, error) {
	batchResources, err := ctl.rdb.SMembers("batch:" + batchID + ":resources").Result()
	if err != nil {
		return false, err
	}
	counter, err := ctl.rdb.HGetAll("batch:" + batchID + ":counter").Result()
	if err != nil {
		return false, err
	}
	for _, resourceID := range batchResources {
		extractCountStr, isExtracting := counter["resource:"+resourceID+":extracted"]
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
		loadCountStr, isLoading := counter["resource:"+resourceID+":loaded"]
		if !isLoading {
			return false, nil
		}
		loadCountInt, err := strconv.ParseInt(loadCountStr, 10, 32)
		if err != nil {
			return false, err
		}
		if extractCountInt > loadCountInt {
			log.Printf("continue batch %s of resources %v: %v", batchID, batchResources, counter)
			return false, nil
		}
	}
	log.Printf("end of batch %s of resources %v: %v", batchID, batchResources, counter)
	return true, nil
}

// ListenAndDestroy consumes load.* topics and destroy a batch when all resources have been loaded.
// Each time a new resource instance is loaded, the batch_id counter of the resource type resource_id in Redis is
// incremented. A batch counter is a Redis hash of key "batch:{batch_id}:counter" containing elements of keys
// "resource:{resource_id}:extracted" and "resource:{resource_id}:loaded".
// "resource:{resource_id}:extracted" refers to the number of resources of type {resource_id} extracted.
// "resource:{resource_id}:loaded" refers to the number of loaded resources of type {resource_id}.
// The list of resource types of a batch is in a Redis set "batch:{batch_id}:resources"
func (ctl BatchController) ListenAndDestroy() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  kafkaURL,
		"group.id":           consumerGroupID,
		"session.timeout.ms": 6000,
		// topic.metadata.refresh.interval.ms (default 5 min) is the period of time
		// in milliseconds after which we force a refresh of metadata.
		// Here we refresh the list of consumed topics every 5s.
		"topic.metadata.refresh.interval.ms": 5000,
		"auto.offset.reset":                  "earliest"})
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
					break
				}
				eob, err := ctl.isEndOfBatch(msg.BatchID)
				if err != nil {
					log.Println(err)
					break
				}
				if eob {
					log.Println("ending batch: " + msg.BatchID)
					if err := ctl.Destroy(msg.BatchID); err != nil {
						log.Println(err)
						break
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
