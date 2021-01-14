package batch

// ResourceRequest is the body of the POST /batch request.
type ResourceRequest struct {
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

// Response describes a batch in request response payload
type Response struct {
	Id        string   `json:"id"`
	Timestamp string   `json:"timestamp,omitempty"`
	Resources []string `json:"resources,omitempty"`
}
