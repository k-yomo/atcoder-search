package httptestutil

import (
	"net/http"
	"testing"
)

type RoundTripFunc func(req *http.Request) *http.Response

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req), nil
}

func NewTestClient(t *testing.T, fn RoundTripFunc) *http.Client {
	t.Helper()

	return &http.Client{
		Transport: fn,
	}
}
