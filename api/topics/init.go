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

var NumParts int

func init() {
	numPartsEnv, isNumPartsEnv := os.LookupEnv("KAFKA_NUMBER_PARTITIONS")
	if isNumPartsEnv {
		NumPartsLong, err := strconv.ParseInt(numPartsEnv, 10, 32)
		if err != nil {
			panic(err)
		}
		NumParts = int(NumPartsLong)
	} else {
		NumParts = 1
	}
}
