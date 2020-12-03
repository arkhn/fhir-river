package topics

const (
	BatchPrefix       = "batch."
	ExtractPrefix     = "extract."
	TransformPrefix   = "transform."
	LoadPrefix        = "load."
	NumParts          = 1
	ReplicationFactor = 3
	Batch             = "^batch\\..*"
	Extract           = "^extract\\..*"
	Transform         = "^transform\\..*"
	Load              = "^load\\..*"
)
