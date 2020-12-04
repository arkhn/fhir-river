package preview

import "os"

var (
	extractorURL, isExtractorURLDefined            = os.LookupEnv("EXTRACTOR_URL")
	transformerURL, isTransformerURLDefined        = os.LookupEnv("TRANSFORMER_URL")
)

// ensure that the required environment variables are defined.
// this function is run when this package is imported.
func init() {
	if !isExtractorURLDefined {
		panic("EXTRACTOR_URL is required in environment")
	}
	if !isTransformerURLDefined {
		panic("TRANSFORMER_URL is required in environment")
	}
}
