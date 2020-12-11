package batch

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/arkhn/fhir-river/api/topics/monitor"
)

func Cancel(ctl monitor.BatchController) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		batchID := vars["id"]
		if err := ctl.Destroy(batchID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		// return the batch ID to the client immediately.
		_, _ = fmt.Fprint(w, batchID)
	}
}
