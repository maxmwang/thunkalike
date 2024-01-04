package game

import (
	"errors"

	"nhooyr.io/websocket"
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
func (gm *Manager) AddPlayer(code, username string) error {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not add player: game with code " + code + " does not exist")
	}

	err := g.AddPlayer(username)
	return err
}

// ConnectPlayer connects an existing player's websocket connection
func (gm *Manager) ConnectPlayer(code, username string, conn *websocket.Conn) error {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not connect player: game with code " + code + " does not exist")
	}

	err := g.ConnectPlayer(username, conn)
	return err
}
