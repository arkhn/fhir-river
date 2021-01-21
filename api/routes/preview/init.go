package preview

import "os"

var controlURL, isControlURLDefined = os.LookupEnv("CONTROL_API_URL")

func init() {
	if !isControlURLDefined {
		panic("CONTROL_API_URL is required in environment")
	}
}
