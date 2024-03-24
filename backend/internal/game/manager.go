package game

import (
	"encoding/json"
	"errors"
	"math/rand"
)

type game interface {
	addPlayer(username string) error
	connectPlayer(username string, con conn) error
	handleMessage(con conn, message string, body json.RawMessage) error
}

type Manager struct {
	games map[string]game
}

func NewManager() *Manager {
	return &Manager{
		games: make(map[string]game),
	}
}

func (gm *Manager) Create(mode, host string) (code string) {
	for i := 0; i < 4; i++ {
		code += string(rune(rand.Intn(26) + 65))
	}

	switch mode {
	case "classic":
		gm.games[code] = newClassic(code, host)
	case "duet":
		// TODO
	default:
	}
	return code
}

// AddPlayer adds a new player
func (gm *Manager) AddPlayer(code, username string) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("game with code=" + code + " does not exist")
	}

	err = g.addPlayer(username)
	return err
}

// ConnectPlayer connects an existing player's websocket connection
func (gm *Manager) ConnectPlayer(code, username string, conn conn) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not connect player: game with code=" + code + " does not exist")
	}

	err = g.connectPlayer(username, conn)
	return err
}

func (gm *Manager) HandleMessage(con conn, code, message string, body json.RawMessage) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not handle message: game with code=" + code + " does not exist")
	}

	err = g.handleMessage(con, message, body)
	return err
}

func (gm *Manager) MarshalJSON() ([]byte, error) {
	return json.Marshal(gm.games)
}
