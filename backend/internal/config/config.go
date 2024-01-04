package config

import (
	"os"

	"github.com/joho/godotenv"
)

type config struct {
	Port string
}

var Env config

func Load() {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}

	Env = config{
		Port: os.Getenv("PORT"),
	}
}
