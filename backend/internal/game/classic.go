package game

import (
	"context"
	"encoding/json"
	"errors"
	"math/rand"

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

	phase    phase
	words    []string
	word     string
	pedestal string

	started bool
	c       chan playerMessage
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
	// TODO: write to conn game state
	return
}

func (g *classic) handleMessage(message string, body []byte) (err error) {
	m := playerMessage{
		Message: message,
		Body:    body,

		// errCh is used to send errors back to the player
		errCh: make(chan error),
	}

	g.c <- m
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
		case m := <-g.c:
			switch g.phase.now {
			case waitingPhase:
				switch m.Message {
				case "ready":
					var body struct {
						Username string `json:"username"`
					}
					if err := json.Unmarshal(m.Body, &body); err != nil {
						m.errCh <- err
						continue
					}

					g.Players[body.Username].IsReady = true
					if err := g.broadcast("ready", body); err != nil {
						m.errCh <- err
						continue
					}

					// next phase if all players are ready
					for _, p := range g.Players {
						if !p.IsReady {
							continue
						}
					}
					g.phase.next()

					// choose random pedestal then broadcast
					playerUsernames := make([]string, 0, len(g.Players))
					for username := range g.Players {
						playerUsernames = append(playerUsernames, username)
					}
					g.pedestal = playerUsernames[rand.Intn(len(playerUsernames))]
					if err := g.broadcast(g.phase.String(), g.pedestal); err != nil {
						m.errCh <- err
						continue
					}

					m.errCh <- nil
				default:
					m.errCh <- errors.New("could not handle message: message=" + m.Message + " is invalid during phase=" + g.phase.String())
				}

			case previewPhase:
				switch m.Message {
				default:
					m.errCh <- errors.New("could not handle message: message=" + m.Message + " is invalid during phase=" + g.phase.String())
				}

			case answerPhase:
				switch m.Message {
				case "answer":
					var body struct {
						Username string `json:"username"`
						Answer   string `json:"answer"`
					}
					if err := json.Unmarshal(m.Body, &body); err != nil {
						m.errCh <- err
						continue
					}

					g.Players[body.Username].Answer = body.Answer

					m.errCh <- nil
				default:
					m.errCh <- errors.New("could not handle message: message=" + m.Message + " is invalid during phase=" + g.phase.String())
				}

			case revealPhase:
				switch m.Message {
				case "next":
					var body struct {
						Username string `json:"username"`
					}
					if err := json.Unmarshal(m.Body, &body); err != nil {
						m.errCh <- err
						continue
					}

					if !g.Players[body.Username].IsHost {
						m.errCh <- errors.New("could not handle message: player with username=" + body.Username + " is not the host")
						continue
					}
					g.phase.next()

					m.errCh <- nil
				default:
					m.errCh <- errors.New("could not handle message: message=" + m.Message + " is invalid during phase=" + g.phase.String())
				}
			}
		case <-g.phase.ticker.C:
			switch g.phase.now {
			case previewPhase:
				g.phase.next()
				g.word = g.words[rand.Intn(len(g.words))]
				if err := g.broadcast(g.phase.String(), g.word); err != nil {
					// TODO: log
				}
			case answerPhase:
				g.phase.next()
				// TODO: calculate and broadcast Scores, Answers
			default:
				continue
			}
		}
	}
}
