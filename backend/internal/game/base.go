package game

import (
	"encoding/json"
	"slices"

	"backend/internal/server"

	"github.com/olahol/melody"
)

type abstractPlayer struct {
	Username string `json:"username"`
	Answer   string `json:"answer"`
	Session  *melody.Session
	game     *abstractGame
}

type ConcretePlayer interface {
	HandleMessage(message, body string)
}

func (p *abstractPlayer) ready(isReady bool) {
	p.game.ReadyPlayers[p.Username] = isReady
}

type abstractGame struct {
	Code         string           `json:"code"`
	Host         string           `json:"host"`
	Players      []abstractPlayer `json:"players"`
	Spectators   []abstractPlayer `json:"spectators"`
	ReadyPlayers map[string]bool  `json:"readyPlayers"`
}

type ConcreteGame interface {
	AddPlayer(username string) *ConcretePlayer
	endGame()
}

func (g *abstractGame) endGame() {
	//
}

func (g *abstractGame) RemovePlayer(player *abstractPlayer) {
	//
}

func (g *abstractGame) UsernameTaken(code, username string) bool {
	f := func(p abstractPlayer) bool {
		return p.Username == username
	}

	return slices.ContainsFunc(g.Players, f) ||
		slices.ContainsFunc(g.Spectators, f)
}

func (g *abstractGame) unreadyAllPlayers() {
	g.ReadyPlayers = make(map[string]bool)
}

func (g *abstractGame) broadcast(message, body string) {
	s := make([]*melody.Session, 0)

	for _, player := range g.Players {
		s = append(s, player.session)
	}
	for _, spectator := range g.Spectators {
		s = append(s, spectator.session)
	}

	res, err := json.Marshal(&server.SocketResponse{
		Message: message,
		Body:    body,
	})
	if err != nil {
		panic(err)
	}

	err = server.M.BroadcastMultiple(res, s)
	if err != nil {
		panic(err)
	}
}
