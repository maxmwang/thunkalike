package game

// conn represents a player's websocket connection. Variables of type conn
// are often named con.
type conn interface {
	SendJson(message string, body any) error
}
