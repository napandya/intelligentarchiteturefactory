package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

// New returns a reverse proxy that forwards /prefix/* to target/prefix/* unchanged.
func New(target, prefix string) http.Handler {
	return build(target, prefix, false)
}

// NewStreaming is for SSE endpoints: disables buffering so tokens flush immediately.
func NewStreaming(target, prefix string) http.Handler {
	return build(target, prefix, true)
}

func build(target, prefix string, streaming bool) http.Handler {
	u, err := url.Parse(target)
	if err != nil {
		panic(err)
	}
	rp := httputil.NewSingleHostReverseProxy(u)
	original := rp.Director
	rp.Director = func(req *http.Request) {
		original(req)
		req.URL.Path = singleJoiningSlash(u.Path, req.URL.Path)
		req.Host = u.Host
		req.Header.Del("Cookie") // downstream services trust X-User-ID from the gateway
		if streaming {
			req.Header.Set("Accept", "text/event-stream")
		}
	}
	if streaming {
		rp.FlushInterval = -1 // flush every write
		rp.ModifyResponse = func(resp *http.Response) error {
			resp.Header.Set("X-Accel-Buffering", "no")
			resp.Header.Set("Cache-Control", "no-cache")
			return nil
		}
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, prefix) {
			http.NotFound(w, r)
			return
		}
		rp.ServeHTTP(w, r)
	})
}

func singleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}
