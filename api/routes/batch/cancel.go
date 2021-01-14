package batch

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/arkhn/fhir-river/api/topics/monitor"
)

func Cancel(ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var response Response
		vars := mux.Vars(r)
		batchID := vars["id"]
		if err := ctl.Destroy(batchID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		response.Id = batchID
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
