package game

import (
	"encoding/json"
	"errors"
	"math/rand"

	"nhooyr.io/websocket"
)

type game interface {
	addPlayer(username string) error
	connectPlayer(username string, conn *websocket.Conn) error
	handleMessage(message string, body []byte) error
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
	for i := 0; i < 4; i++ {
		code += string(rune(rand.Intn(26) + 65))
	}

	switch mode {
	case "classic":
		gm.games[code] = newClassic(code)
	case "duet":
		// TODO
	default:
		err = errors.New("could not create game: mode=" + mode + " is invalid")
	}
	return
}

// AddPlayer adds a new player
func (gm *Manager) AddPlayer(code, username string) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not add player: game with code=" + code + " does not exist")
	}

	err = g.addPlayer(username)
	return
}

// ConnectPlayer connects an existing player's websocket connection
func (gm *Manager) ConnectPlayer(code, username string, conn *websocket.Conn) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not connect player: game with code=" + code + " does not exist")
	}

	err = g.connectPlayer(username, conn)
	return
}

func (gm *Manager) HandleMessage(body []byte) (err error) {
	var b struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	}
	if err = json.Unmarshal(body, &b); err != nil {
		// TODO: ws error handling
		return
	}

	err = gm.games[b.Code].handleMessage(b.Message, body)
	return
}
