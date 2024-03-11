package game

import (
	"encoding/json"
	"errors"
	"math/rand"

	"nhooyr.io/websocket"
)

type game interface {
	addPlayer(username string, isHost bool) error
	connectPlayer(username string, conn *websocket.Conn) error
	handleMessage(message string, body json.RawMessage) error
}

type manager struct {
	games map[string]game
}
type Manager manager

func NewManager() *Manager {
	return &Manager{
		games: make(map[string]game),
	}
}

func (gm *Manager) Create(mode string) (code string) {
	for i := 0; i < 4; i++ {
		code += string(rune(rand.Intn(26) + 65))
	}

	switch mode {
	case "classic":
		gm.games[code] = newClassic(code)
	case "duet":
		// TODO
	default:
	}
	return code
}

// AddPlayer adds a new player
func (gm *Manager) AddPlayer(code, username string, isHost bool) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("game with code=" + code + " does not exist")
	}

	err = g.addPlayer(username, isHost)
	return err
}

// ConnectPlayer connects an existing player's websocket connection
func (gm *Manager) ConnectPlayer(code, username string, conn *websocket.Conn) (err error) {
	g, ok := gm.games[code]
	if !ok {
		return errors.New("could not connect player: game with code=" + code + " does not exist")
	}

	err = g.connectPlayer(username, conn)
	return err
}

func (gm *Manager) HandleMessage(body []byte) (err error) {
	var b struct {
		Code    string          `json:"code"`
		Message string          `json:"message"`
		Body    json.RawMessage `json:"body"`
	}
	if err = json.Unmarshal(body, &b); err != nil {
		// TODO: ws error handling
		return err
	}

	g, ok := gm.games[b.Code]
	if !ok {
		return errors.New("could not handle message: game with code=" + b.Code + " does not exist")
	}

	err = g.handleMessage(b.Message, b.Body)
	return err
}

func (gm *Manager) MarshalJSON() ([]byte, error) {
	return json.Marshal(gm.games)
}
