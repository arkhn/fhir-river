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
		vars := mux.Vars(r)
		batchID := vars["id"]
		resources, err := ctl.BatchResources(batchID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if err := json.NewEncoder(w).Encode(resources); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}
