package scripts

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// Run is the HTTP handler for the GET /scripts route.
// It simply proxies the request to control-api.
func Run(w http.ResponseWriter, r *http.Request) {
	remote, err := url.Parse(fmt.Sprintf("%s/api", controlURL))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(remote)
	// We need to change the HOST header in order to pass control-api ALLOWED_HOSTS.
	r.Host = remote.Hostname()
	proxy.ServeHTTP(w, r)
}
