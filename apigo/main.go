package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/arkhn/fhir-river/api/api"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	log "github.com/sirupsen/logrus"
)

const (
	consumerGroupID = "api"
)

var (
	port, isPortDefined         = os.LookupEnv("PORT")
	kafkaURL, isKafkaURLDefined = os.LookupEnv("KAFKA_BOOTSTRAP_SERVERS")
)

// ensure that the required environment variables are defined
func init() {
	if !isPortDefined {
		panic("PORT is required in environment")
	}

	if !isKafkaURLDefined {
		panic("KAFKA_BOOTSTRAP_SERVERS is required in environment")
	}

	// Use the default text formatter.
	log.SetFormatter(&log.TextFormatter{})

	// Output to stdout instead of the default stderr
	log.SetOutput(os.Stdout)

	// Only log the debug severity or above.
	log.SetLevel(log.DebugLevel)
}

func main() {
	// create a new kafka producer
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaURL})
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

	// define the HTTP routes and handlers
	router := mux.NewRouter()
	router.HandleFunc("/preview", api.Preview).Methods("POST")
	router.HandleFunc("/batch", api.Batch(producer)).Methods("POST")
	router.HandleFunc("/batch/{id}", api.CancelBatch).Methods("POST")
	router.HandleFunc("/ws", api.Subscribe(consumer)).Methods("GET")


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
	signal.Notify(c, syscall.SIGTERM)
	<-c
	log.Println("Shutting down River API gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := s.Shutdown(ctx); err != nil {
		log.Println(err)
	}
}
