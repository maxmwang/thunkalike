package game

import (
	"context"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type serverMessage struct {
	Message string `json:"message"`
	Body    any    `json:"body"`
}

// sendJson constructs a serverMessage with the given message and body,
// then uses wsjson.Write to write the message to the websocket connection.
func sendJson(c *websocket.Conn, message string, body any) error {
	m := serverMessage{message, body}

	return wsjson.Write(context.Background(), c, m)
}
