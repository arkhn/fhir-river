package main

import (
	"os"

	log "github.com/sirupsen/logrus"
)

var port, isPortDefined = os.LookupEnv("PORT")

// ensure that the required environment variables are defined
func init() {
	if !isPortDefined {
		panic("PORT is required in environment")
	}

	// Use the default text formatter.
	log.SetFormatter(&log.TextFormatter{})

	// Output to stdout instead of the default stderr
	log.SetOutput(os.Stdout)

	// Only log the debug severity or above.
	log.SetLevel(log.DebugLevel)
}
