package batch

// Resource descibes a resource of a batch
type Resource struct {
	ID           string `json:"resource_id"`
	ResourceType string `json:"resource_type"`
}

// ResourceList describes a list of resources of a batch
type ResourceList struct {
	Resources []Resource `json:"resources"`
}

// Event is the kind of event produced to trigger a batch ETL.
type Event struct {
	BatchID    string `json:"batch_id"`
	ResourceID string `json:"resource_id"`
}

// Batch describes a batch in request response payload
type Batch struct {
	ID        string `json:"id"`
	Timestamp string `json:"timestamp,omitempty"`
}
