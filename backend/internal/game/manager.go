package game

import (
	"context"
	"errors"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type game interface {
	AddPlayer(username string) error
	ConnectPlayer(username string, conn *websocket.Conn) error
}

type Manager struct {
	games map[string]game
}

func NewManager() *Manager {
	return &Manager{
		games: make(map[string]game),
	}
}

func (gm *Manager) Create(mode string) (code string, err error) {
	switch mode {
	case "classic":
		// TODO
	case "duet":
		// TODO
	default:
		err = errors.New("invalid mode")
	}
	return
}

// AddPlayer adds a new player
func (gm *Manager) AddPlayer(code, username string) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not add player: game with code " + code + " does not exist")
	}

	err = g.AddPlayer(username)
	return err
}

// ConnectPlayer connects an existing player's websocket connection
func (gm *Manager) ConnectPlayer(code, username string, conn *websocket.Conn) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not connect player: game with code " + code + " does not exist")
	}

	err = g.ConnectPlayer(username, conn)
	return err
}

func (gm *Manager) HandleConnection(ctx context.Context, conn *websocket.Conn) (err error) {
	var body struct {
		Message string `json:"message"`
	}

	if err = wsjson.Read(ctx, conn, &body); err != nil {
		return
	}

	// TODO: handle
	err = wsjson.Write(ctx, conn, body)

	return
}
