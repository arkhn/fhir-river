package batch

import (
	"encoding/json"
	"net/http"

	"github.com/arkhn/fhir-river/api/topics/monitor"
)

func List(ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var response []Response
		list, err := ctl.BatchList()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for id, timestamp := range list {
			response = append(response, Response{Id: id, Timestamp: timestamp})
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
