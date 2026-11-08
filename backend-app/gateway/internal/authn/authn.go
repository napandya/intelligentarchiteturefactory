package authn

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

// Verifier checks the session cookie / Bearer token against the auth service,
// then injects the user id into the request context for downstream services.

type contextKey string

const (
	UserIDKey    contextKey = "user_id"
	UserEmailKey contextKey = "user_email"
)

type Verifier struct {
	authURL string
	client  *http.Client
}

func NewVerifier(authURL string) *Verifier {
	return &Verifier{authURL: authURL, client: &http.Client{}}
}

type meResponse struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
}

func (v *Verifier) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, v.authURL+"/api/auth/me", nil)
		if err != nil {
			http.Error(w, `{"detail":"auth unavailable"}`, http.StatusBadGateway)
			return
		}
		if c, err := r.Cookie("session_token"); err == nil {
			req.AddCookie(c)
		}
		if h := r.Header.Get("Authorization"); h != "" {
			req.Header.Set("Authorization", h)
		}
		resp, err := v.client.Do(req)
		if err != nil || resp.StatusCode != http.StatusOK {
			if resp != nil {
				resp.Body.Close()
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"detail":"Not authenticated"}`))
			return
		}
		defer resp.Body.Close()
		var me meResponse
		if err := json.NewDecoder(resp.Body).Decode(&me); err != nil || me.UserID == "" {
			http.Error(w, `{"detail":"Not authenticated"}`, http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), UserIDKey, me.UserID)
		ctx = context.WithValue(ctx, UserEmailKey, me.Email)
		// Forward identity to downstream services via trusted internal headers.
		r.Header.Set("X-User-ID", me.UserID)
		r.Header.Set("X-User-Email", strings.TrimSpace(me.Email))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
