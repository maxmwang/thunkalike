package main

import (
	"backend/internal/config"
	"backend/internal/server"
)

func main() {
	config.Load()
	server.Start()
}
