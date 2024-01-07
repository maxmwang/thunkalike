package game

import (
	"context"
	"errors"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type playerMessage struct {
	Message string `json:"message"`
	Body    []byte `json:"body"`

	errCh chan error
}

// TODO: add concurrency safety
type classic struct {
	Code    string             `json:"code"`
	Players map[string]*player `json:"players"`
	// TODO: spectators
	// TODO: options

	ticker *time.Ticker
	phase  phase
	word   string

	started bool
	ch      chan playerMessage
}

func newClassic(code string) *classic {
	return &classic{
		Code:    code,
		Players: make(map[string]*player),
	}
}

func (g *classic) addPlayer(username string) (err error) {
	if _, ok := g.Players[username]; ok {
		return errors.New("could not add player: player with username=" + username + " already exists")
	}

	g.Players[username] = &player{
		Username: username,
		IsHost:   len(g.Players) == 0,
	}
	return
}

func (g *classic) connectPlayer(username string, conn *websocket.Conn) (err error) {
	p, ok := g.Players[username]
	if !ok {
		return errors.New("could not connect player: player with username=" + username + " does not exist")
	}
	p.conn = conn

	err = g.broadcast("join", *p)
	return
}

func (g *classic) handleMessage(message string, body []byte) (err error) {
	m := playerMessage{
		Message: message,
		Body:    body,

		// errCh is used to send errors back to the player
		errCh: make(chan error),
	}

	g.ch <- m
	err = <-m.errCh

	return
}

func (g *classic) broadcast(message string, body any) (err error) {
	res := struct {
		Message string `json:"message"`
		Body    any    `json:"body"`
	}{message, body}

	for _, p := range g.Players {
		if err = wsjson.Write(context.Background(), p.conn, res); err != nil {
			// TODO: handle error
		}
	}

	return
}

func (g *classic) start() {
	if g.started {
		// TODO: log
		return
	}
	g.started = true

	for {
		select {
		case m := <-g.ch:
			switch g.phase.now {
			case waitingPhase:
				switch m.Message {
				}
			case previewPhase:
				switch m.Message {

				}
			case answerPhase:
				switch m.Message {

				}
			case revealPhase:
				switch m.Message {

				}
			}
		case <-g.ticker.C:

		}
	}
	g.phase.next()

}
