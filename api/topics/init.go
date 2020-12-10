package topics

import (
	"os"
	"strconv"
)

const (
	BatchPrefix       = "batch."
	ExtractPrefix     = "extract."
	TransformPrefix   = "transform."
	LoadPrefix        = "load."
	ReplicationFactor = 1
	Batch             = "^batch\\..*"
	Extract           = "^extract\\..*"
	Transform         = "^transform\\..*"
	Load              = "^load\\..*"
)

var NumParts int64

func init() {
	numPartsEnv, isNumPartsEnv := os.LookupEnv("KAFKA_NUMBER_PARTITIONS")
	if !isNumPartsEnv {
		NumParts = 1
	} else {
		var err error
		if NumParts, err = strconv.ParseInt(numPartsEnv, 10, 32); err != nil {
			panic(err)
		}
	}
}
