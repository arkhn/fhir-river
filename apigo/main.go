package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"
	"github.com/segmentio/kafka-go"
	log "github.com/sirupsen/logrus"

	"github.com/arkhn/fhir-river/api/api"
)

var (
	port, isPortDefined         = os.LookupEnv("PORT")
	kafkaURL, isKafkaURLDefined = os.LookupEnv("KAFKA_BOOTSTRAP_SERVERS")
	topic                       = "batch"
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
	producer := kafka.NewWriter(kafka.WriterConfig{
		Brokers:  []string{kafkaURL},
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	})
	defer producer.Close()

	// define the HTTP routes and handlers
	router := httprouter.New()
	router.POST("/preview", api.Preview)
	router.POST("/batch", api.Batch(producer))
	router.GET("/ws", api.Subscribe)

	// this is a temporary route to test websocket functionality
	router.HandlerFunc("GET", "/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("home")
		http.ServeFile(w, r, "websockets.html")
	})

	// run the HTTP server
	log.Infof("Listening on port %s...", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}
