package server

import (
	"encoding/json"
	"errors"
	"math/rand"

	g "backend/internal/game"

	"nhooyr.io/websocket"
)

type game interface {
	AddPlayer(username string) error
	ConnectPlayer(username string, conn *websocket.Conn) error
	HandleMessage(conn *websocket.Conn, message string, body json.RawMessage) error
}

type manager struct {
	games map[string]game
}

func newManager() *manager {
	return &manager{
		games: make(map[string]game),
	}
}

func (gm *manager) create(mode, host string) (code string) {
	for i := 0; i < 4; i++ {
		code += string(rune(rand.Intn(26) + 65))
	}

	switch mode {
	case "classic":
		gm.games[code] = g.NewClassic(code, host)
	case "duet":
		// TODO
	default:
	}
	return code
}

// addPlayer adds a new player
func (gm *manager) addPlayer(code, username string) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("game with code=" + code + " does not exist")
	}

	err = g.AddPlayer(username)
	return err
}

// connectPlayer connects an existing player's websocket connection
func (gm *manager) connectPlayer(code, username string, conn *websocket.Conn) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not connect player: game with code=" + code + " does not exist")
	}

	err = g.ConnectPlayer(username, conn)
	return err
}

func (gm *manager) handleMessage(conn *websocket.Conn, code, message string, body json.RawMessage) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not handle message: game with code=" + code + " does not exist")
	}

	err = g.HandleMessage(conn, message, body)
	return err
}

func (gm *manager) MarshalJSON() ([]byte, error) {
	return json.Marshal(gm.games)
}
