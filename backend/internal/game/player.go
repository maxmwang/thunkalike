package game

import (
	"nhooyr.io/websocket"
)

type player struct {
	Username string `json:"username"`
	IsHost   bool   `json:"isHost"`

	IsReady bool   `json:"isReady"`
	Score   int    `json:"score"`
	Answer  string `json:"answer"`

	conn *websocket.Conn
}
