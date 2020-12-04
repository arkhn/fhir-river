package topics

const (
<<<<<<< HEAD
	BatchPrefix     = "batch."
	ExtractPrefix   = "extract."
	TransformPrefix = "transform."
	LoadPrefix      = "load."
	NumParts        = 3
	Batch           = "^batch.*"
	Extract         = "^extract.*"
	Transform       = "^transform.*"
	Load            = "^load.*"
=======
	BatchPrefix       = "batch."
	ExtractPrefix     = "extract."
	TransformPrefix   = "transform."
	LoadPrefix        = "load."
	NumParts          = 3
	ReplicationFactor = 1
	Batch             = "^batch\\..*"
	Extract           = "^extract\\..*"
	Transform         = "^transform\\..*"
	Load              = "^load\\..*"
>>>>>>> master
)
