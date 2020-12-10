package topics

import (
	"os"
	"strconv"
	"strings"
)

type Topic struct {
	Prefix   string
	Regex    string
	numParts int
}

func New(title string) Topic {
	var numParts int
	numPartsEnv, isNumPartsEnv := os.LookupEnv("KAFKA_" + strings.ToUpper(title) + "_NUMBER_PARTITIONS")
	if isNumPartsEnv {
		var err error
		numParts, err = strconv.Atoi(numPartsEnv)
		if err != nil {
			panic(err)
		}
	} else {
		numParts = 1
	}
	return Topic{
		Prefix:   title + ".",
		Regex:    "^" + title + "\\..*",
		numParts: numParts,
	}
}


