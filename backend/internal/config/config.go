package config

import (
	"github.com/joho/godotenv"
	"os"
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
