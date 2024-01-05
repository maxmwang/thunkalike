package game

import (
	"nhooyr.io/websocket"
)

type player struct {
	username string
	isHost   bool

	score  int
	answer string

	conn *websocket.Conn
}
