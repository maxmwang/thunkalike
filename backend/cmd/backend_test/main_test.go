package main

import (
	"net/http/httptest"

	"backend/internal/server"
)

func main() {
	r := server.New()
	ts := httptest.NewServer(r)
	defer ts.Close()
}
