package game

import (
	"context"
	"encoding/json"
	"errors"
	"math/rand"
	"time"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

/*
 * A message received from a player, as perceived by the game. Note that
 * although the player should send a code field, the game does not see
 * as it should already be consumed by the server.
 */
type playerMessage struct {
	Message string          `json:"message"`
	Body    json.RawMessage `json:"body"`

	errCh chan error /* error channel to return to the server */
}

func newPlayerMessage(message string, body json.RawMessage) playerMessage {
	return playerMessage{
		Message: message,
		Body:    body,

		errCh: make(chan error),
	}
}

/*
 * A message sent from the game to a player.
 */
type gameMessage struct {
	Message string `json:"message"`
	Body    any    `json:"body"`
}

type classic struct {
	Code    string             `json:"code"`
	Mode    string             `json:"mode"`
	Players map[string]*player `json:"players"`
	// TODO: spectators
	// TODO: options

	phase  phase
	ticker *time.Ticker
	// TODO: better words management
	words    []string
	word     string
	pedestal string
	Host     string `json:"host"`

	started bool
	c       chan playerMessage
}

func newClassic(code string) *classic {
	g := &classic{
		Code:    code,
		Mode:    "classic",
		Players: make(map[string]*player),

		phase:  phase{now: waitingPhase},
		ticker: time.NewTicker(5 * time.Second),
		words:  []string{"apple", "banana", "cherry", "durian", "eggplant", "fig", "grape", "honeydew", "ice cream", "jackfruit", "kiwi", "lemon", "mango", "nectarine", "orange", "peach", "quince", "raspberry", "strawberry", "tomato", "ugli", "vanilla", "watermelon", "xigua", "yuzu", "zucchini"},

		c: make(chan playerMessage),
	}
	go g.start()

	return g
}

func (g *classic) addPlayer(username string, isHost bool) (err error) {
	if _, ok := g.Players[username]; ok {
		return errors.New("could not add player: player with username=" + username + " already exists")
	}

	if isHost {
		if g.Host != "" {
			return errors.New("could not add host player: host already exists")
		}
		g.Host = username
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

	err = wsjson.Write(context.Background(), p.conn, gameMessage{"self", *p})
	err = g.broadcastMessage("join", *g)
	return
}

func (g *classic) handleMessage(message string, body json.RawMessage) (err error) {
	m := newPlayerMessage(message, body)

	g.c <- m
	err = <-m.errCh

	return
}

func (g *classic) broadcastMessage(message string, body any) (err error) {
	m := gameMessage{message, body}

	for _, p := range g.Players {
		if p.conn == nil {
			continue
		}
		if err = wsjson.Write(context.Background(), p.conn, m); err != nil {
			// TODO: handle error
		}
	}

	return nil
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

					if _, ok := g.Players[body.Username]; !ok {
						m.errCh <- errors.New("could not handle message: player with username=" + body.Username + " does not exist")
						continue
					}

					g.Players[body.Username].IsReady = true
					if err := g.broadcastMessage("ready", body); err != nil {
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

					// choose random pedestal then broadcastMessage
					playerUsernames := make([]string, 0, len(g.Players))
					for username := range g.Players {
						playerUsernames = append(playerUsernames, username)
					}
					g.pedestal = playerUsernames[rand.Intn(len(playerUsernames))]
					if err := g.broadcastMessage(g.phase.String(), g.pedestal); err != nil {
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

					if g.Host != body.Username {
						m.errCh <- errors.New("could not handle message: player with username=" + body.Username + " is not the host")
						continue
					}
					g.phase.next()

					m.errCh <- nil
				default:
					m.errCh <- errors.New("could not handle message: message=" + m.Message + " is invalid during phase=" + g.phase.String())
				}
			}
		case <-g.ticker.C:
			switch g.phase.now {
			case previewPhase:
				g.phase.next()
				g.word = g.words[rand.Intn(len(g.words))]
				if err := g.broadcastMessage(g.phase.String(), g.word); err != nil {
					// TODO: log
				}
			case answerPhase:
				g.phase.next()

				matches := 0
				// TODO: add metric to options
				m := metrics.NewHamming()
				for _, p := range g.Players {
					if p.Username == g.pedestal {
						continue
					}

					// TODO: add string proximity to options
					if strutil.Similarity(p.Answer, g.Players[g.pedestal].Answer, m) > 0.8 {
						p.Score += 10
						matches++
					}
				}
				g.Players[g.pedestal].Score += max((matches/len(g.Players))*10, 5)

				if err := g.broadcastMessage(g.phase.String(), g.Players); err != nil {
					// TODO: log
				}
			default:
				continue
			}
		}
	}
}
