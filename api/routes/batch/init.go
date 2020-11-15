package batch

import "os"

const (
	batchTopicPrefix     = "batch."
	extractTopicPrefix   = "extract."
	transformTopicPrefix = "transform."
	loadTopicPrefix      = "load."
	numTopicPartitions   = 2
)

var loaderURL, isLoaderURLDefined = os.LookupEnv("LOADER_URL")

func init() {
	if !isLoaderURLDefined {
		panic("LOADER_URL is required in environment")
	}
}
