package scripts

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

// Run is the HTTP handler for the POST /preview route.
// It calls both the extractor and the transformer service to preview
// the FHIR transformation of a set of rows for a given resource.
func Run(w http.ResponseWriter, r *http.Request) {
	remote, err := url.Parse(controlURL)
	if err != nil {
		panic(err)
	}

	proxy := httputil.NewSingleHostReverseProxy(remote)
	proxy.ServeHTTP(w, r)
}
