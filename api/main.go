package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/go-redis/redis"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/arkhn/fhir-river/api/monitor"
	"github.com/arkhn/fhir-river/api/routes/batch"
	"github.com/arkhn/fhir-river/api/routes/preview"
	"github.com/arkhn/fhir-river/api/routes/websockets"
)

func main() {
	// create Kafka admin client
	admin, err := kafka.NewAdminClient(&kafka.ConfigMap{"bootstrap.servers": kafkaURL})
	if err != nil {
		panic(err)
	}
	defer admin.Close()

	// create a new kafka producer
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaURL,
		"session.timeout.ms": 6000,
		// max.block.ms (default 1 minute) controls how long the producer will block.
		// It can be blocked if the topic has been deleted.
		"max.block.ms": 15000,
	})
	if err != nil {
		panic(err)
	}
	defer producer.Close()

	// create a kafka consumer
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":        kafkaURL,
		"group.id":                 consumerGroupID,
		"go.events.channel.enable": true,
	})
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := consumer.Close(); err != nil {
			log.Println(err)
		}
	}()

	// open Redis connection
	intRedisDb, err := strconv.Atoi(redisDb)
	if err != nil {
		panic("REDIS_COUNTER_DB should represent an int")
	}
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password: redisPassword,
		DB:       intRedisDb,
	})
	defer func () {
		if err := rdb.Close(); err != nil {
			panic(err)
		}
	}()

	// Monitor pipeline
	ctl := monitor.BatchController{Rdb: rdb, KafkaAdmin: admin}
	go ctl.ListenAndDestroy()

	// define the HTTP routes and handlers
	router := mux.NewRouter()
	router.HandleFunc("/preview", preview.Run).Methods("POST")
	router.HandleFunc("/batch", batch.Create(producer, ctl)).Methods("POST")
	router.HandleFunc("/batch/{id}", batch.Cancel(ctl)).Methods("DELETE")
	router.HandleFunc("/ws", websockets.Subscribe(consumer)).Methods("GET")

	// this is a temporary route to test websocket functionality
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("home")
		http.ServeFile(w, r, "websockets.html")
	}).Methods("GET")

	// Run River API server
	s := &http.Server{
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		Handler: handlers.CORS(
			handlers.AllowedHeaders([]string{"Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"}),
			handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
			handlers.AllowedOrigins([]string{"*"}),
			handlers.AllowCredentials(),
		)(router),
	}
	go func() {
		log.Infof("Listening on port %s...", port)
		if err := s.ListenAndServe(); err != http.ErrServerClosed {
			log.Println(err)
		}
	}()
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)
	<-c
	log.Println("Shutting down River API gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := s.Shutdown(ctx); err != nil {
		log.Println(err)
	}
}
