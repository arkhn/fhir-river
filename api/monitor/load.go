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
		extractCount, ok := counter["resource:"+resource+":extract"]
		if !ok {
			return false, nil
		}
		count, err := strconv.ParseInt(extractCount, 10, 32)
		if err != nil {
			return false, err
		}
		if count == 0 {
			continue
		}
		loadCount, ok := counter["resource:"+resource+":load"]
		if !ok {
			return false, nil
		}
		if extractCount != loadCount {
			return false, nil
		}
	}
	return true, nil
}

func Load(rdb *redis.Client, admin *kafka.AdminClient) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":   kafkaURL,
		"group.id":            consumerGroupID,
		"session.timeout.ms":  6000,
		"metadata.max.age.ms": 5000,
		"auto.offset.reset":   "earliest"})
	if err != nil {
		panic(err)
	}
	if err = c.Subscribe(topics.Load, nil); err != nil {
		panic(err)
	}

	s := make(chan os.Signal, 1)
	signal.Notify(s, syscall.SIGTERM, syscall.SIGINT)
	run := true
	for run == true {
		select {
		case sig := <-s:
			log.Printf("Caught signal %v: terminating\n", sig)
			run = false
		default:
			ev := c.Poll(100)
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
				rdb.HIncrBy("batch:"+msg.BatchID, "resource:"+msg.ResourceID+":load", 1)
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
	log.Println("Closing consumer")
	if err = c.Close(); err != nil {
		panic(err)
	}
}
