package conn

import (
	"context"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type Conn websocket.Conn

type serverMessage struct {
	Message string `json:"message"`
	Body    any    `json:"body"`
}

// SendJson constructs a serverMessage with the given message and body,
// then uses wsjson.Write to write the message to the websocket connection.
func (c *Conn) SendJson(message string, body any) error {
	m := serverMessage{message, body}

	return wsjson.Write(context.Background(), (*websocket.Conn)(c), m)
}
