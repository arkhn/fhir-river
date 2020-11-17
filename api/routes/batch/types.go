package batch

// Request is the body of the POST /batch request.
type Request struct {
	Resources []struct {
		ID           string `json:"resource_id"`
		ResourceType string `json:"resource_type"`
	} `json:"resources"`
}

// DeleteResourceRequest is the body of the POST /delete-resource request.
type DeleteResourceRequest struct {
	Resources []struct {
		ID           string `json:"resource_id"`
		ResourceType string `json:"resource_type"`
	} `json:"resources"`
}

// Event is the kind of event produced to trigger a batch ETL.
type Event struct {
	BatchID    string `json:"batch_id"`
	ResourceID string `json:"resource_id"`
}
