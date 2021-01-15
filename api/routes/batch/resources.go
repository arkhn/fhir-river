package batch

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/arkhn/fhir-river/api/topics/monitor"
)

// Resources retrieves the resource ids of a batch
func Resources(ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var response Response
		vars := mux.Vars(r)
		batchID := vars["id"]
		resources, err := ctl.BatchResourcesList(batchID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		response.Id = batchID
		response.Resources = resources
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
