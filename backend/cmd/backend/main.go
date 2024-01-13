package main

import (
	"net/http"

	"backend/internal/config"
	"backend/internal/server"
)

func main() {
	config.Load()

	r := server.New()
	if err := http.ListenAndServe(":"+config.Env.Port, r); err != nil {
		panic(err)
	}
}
