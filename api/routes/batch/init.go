package batch

import (
	"os"
)

var (
	loaderURL, isLoaderURLDefined = os.LookupEnv("LOADER_URL")
)

func init() {
	if !isLoaderURLDefined {
		panic("LOADER_URL is required in environment")
	}
}
