package batch

import (
	"encoding/json"
	"net/http"

	"github.com/arkhn/fhir-river/api/topics/monitor"
)

func List(ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var responseList []Response
		list, err := ctl.BatchList()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for id, timestamp := range list {
			responseList = append(responseList, Response{Id: id, Timestamp: timestamp})
		}
		if err := json.NewEncoder(w).Encode(responseList); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
