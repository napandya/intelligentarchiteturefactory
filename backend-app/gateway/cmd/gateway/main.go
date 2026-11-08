package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"iaf/gateway/internal/authn"
	"iaf/gateway/internal/proxy"
)

// Go API gateway: public edge for /api/* — session verify + reverse proxy to Python services.
// Contracts: specs/openapi/gateway.yaml

func main() {
	cfg := struct {
		Addr         string
		AuthURL      string
		AssistantURL string
		FilesURL     string
		LegacyURL    string
	}{
		Addr:         envOr("GATEWAY_ADDR", ":8080"),
		AuthURL:      envOr("AUTH_SERVICE_URL", "http://localhost:8011"),
		AssistantURL: envOr("ASSISTANT_SERVICE_URL", "http://localhost:8012"),
		FilesURL:     envOr("FILES_SERVICE_URL", "http://localhost:8013"),
		LegacyURL:    envOr("LEGACY_BACKEND_URL", "http://localhost:8001"),
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(120 * time.Second))
	r.Use(corsMiddleware)

	r.Get("/api/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"gateway"}`))
	})

	verifier := authn.NewVerifier(cfg.AuthURL)

	// Auth service: session exchange is public; /me and /logout verify through the service itself.
	r.Mount("/api/auth", proxy.New(cfg.AuthURL, "/api/auth"))

	// Protected routes: gateway verifies session before proxying.
	r.Group(func(r chi.Router) {
		r.Use(verifier.Middleware)
		r.Mount("/api/assistant", proxy.NewStreaming(cfg.AssistantURL, "/api/assistant"))
		r.Mount("/api/files", proxy.New(cfg.FilesURL, "/api/files"))
	})

	// Anything else falls through to the legacy backend during cutover.
	r.Mount("/api/", proxy.New(cfg.LegacyURL, "/api"))

	log.Printf("gateway listening on %s", cfg.Addr)
	log.Fatal(http.ListenAndServe(cfg.Addr, r))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-ID")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
