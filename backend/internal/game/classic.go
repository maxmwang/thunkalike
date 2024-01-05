package game

import (
	"errors"
	"net/http"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// TODO: add concurrency safety
type classic struct {
	code    string
	players map[string]*player
}

func newClassic(code string) *classic {
	return &classic{
		code:    code,
		players: make(map[string]*player),
	}
}

func (g *classic) addPlayer(username string) (err error) {
	if _, ok := g.players[username]; ok {
		return errors.New("could not add player: player with username " + username + " already exists")
	}

	g.players[username] = &player{
		username: username,
		isHost:   len(g.players) == 0,
	}
	return
}

func (g *classic) connectPlayer(username string, conn *websocket.Conn) (err error) {
	p, ok := g.players[username]
	if !ok {
		return errors.New("could not connect player: player with username " + username + " does not exist")
	}

	p.conn = conn
	return
}

func (g *classic) handleConnection(r *http.Request, conn *websocket.Conn) (err error) {
	// TODO
	var body struct {
		Message  string `json:"message"`
		Username string `json:"username"`
	}
	if err = wsjson.Read(r.Context(), conn, &body); err != nil {
		return
	}
	return
}
