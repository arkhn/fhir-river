package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/arkhn/fhir-river/api/routes/batch"
	"github.com/arkhn/fhir-river/api/routes/preview"
	"github.com/arkhn/fhir-river/api/topics/monitor"
)

func main() {
	// Monitor pipeline
	ctl := monitor.NewBatchController()
	defer ctl.Close()
	go ctl.ListenAndDestroy()

	// define the HTTP routes and handlers
	router := mux.NewRouter()
	router.HandleFunc("/preview", preview.Run).Methods("POST")
	router.HandleFunc("/batch", batch.List(ctl)).Methods("GET")
	router.HandleFunc("/batch", batch.Create(ctl)).Methods("POST")
	router.HandleFunc("/batch/{id}", batch.Cancel(ctl)).Methods("DELETE")
	router.HandleFunc("/batch/{id}/resources", batch.Resources(ctl)).Methods("GET")

	// Run River API server
	s := &http.Server{
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		Handler: handlers.CORS(
			handlers.AllowedHeaders([]string{"Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"}),
			handlers.AllowedMethods([]string{"GET", "POST", "DELETE", "OPTIONS"}),
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
