package game

import (
	"encoding/json"
	"errors"
	"math/rand"
	"sync"
	"time"

	"github.com/adrg/strutil"
)

type classicPlayer struct {
	basePlayer

	// Score is the current score of the player.
	//
	// In classic mode, a player's score at the end of a round depends on if
	// the player was the pedestal or not. If the player was the pedestal,
	// the player's score is calculated by:
	// 	score += max(n / (N - 1) * 10, 5)
	// where n is the number of players who guessed the player's answer and N
	// is the total number of players. If the player was not the pedestal and
	// the player's answer is similar to the pedestal's, then the player's
	// score is calculated by:
	// 	score += 10
	Score int `json:"score"`
}

// classicMessage is the struct sent from the classicPlayer's websocket
// connection goroutine to the game goroutine.
type classicMessage struct {
	baseMessage

	p *classicPlayer
}

type classic struct {
	base

	// Players is the list of players in the game. Spectators are not included
	// in this list.
	Players []classicPlayer `json:"players"`

	// playersByUsername is a map of player usernames to players. Used to
	// ensure unique usernames in the game and to identify players by
	// usernames. Usernames must be unique across players and spectators.
	playersByUsername map[string]*classicPlayer

	// playersByConn is a map of player connections to players. Used to
	// identify players by their websocket connection.
	playersByConn map[conn]*classicPlayer

	// Spectators is the list of spectators in the game.
	Spectators []classicPlayer `json:"spectators"`

	// spectatorsByUsername is a map of spectator usernames to spectators.
	// Used to ensure unique usernames in the game and to identify
	// spectators by usernames. Usernames must be unique across players
	// and spectators.
	spectatorsByUsername map[string]*classicPlayer

	// spectatorsByConn is a map of spectator connections to spectators. Used
	// to identify spectators by their websocket connection.
	spectatorsByConn map[conn]*classicPlayer

	// mu is the mutex that protects the Players and Spectators slices related
	// maps. A lock is necessary to ensure usernames are unique.
	mu sync.RWMutex

	// Pedestal is the username of the current pedestal player. Empty if the
	// game is not started or if the game is in the waiting phase.
	Pedestal string `json:"pedestal"`

	// c is the channel that receives player messages. The channel is used to
	// communicate between the game goroutine and the players websocket
	// connection goroutines.
	c chan classicMessage
}

func newClassic(code, host string) *classic {
	g := classic{
		base: newBase(code, "classic", host),

		Players:           make([]classicPlayer, 0),
		playersByUsername: make(map[string]*classicPlayer),
		playersByConn:     make(map[conn]*classicPlayer),

		Spectators:           make([]classicPlayer, 0),
		spectatorsByUsername: make(map[string]*classicPlayer),
		spectatorsByConn:     make(map[conn]*classicPlayer),
	}
	go g.start()

	return &g
}

// addPlayer attempts to add a new player to the game. If the username is
// already in the game, an error is returned. Must be called before
// connectPlayer.
func (g *classic) addPlayer(username string) error {
	g.mu.Lock()
	defer g.mu.Unlock()

	_, inPlayers := g.playersByUsername[username]
	_, inSpectators := g.spectatorsByUsername[username]
	if inPlayers || inSpectators {
		return errors.New("could not add player: player with username=" + username + " already exists")
	}

	// Add player to players slice. It is safe to use the last index because
	// we have obtained the mutex.
	g.Players = append(g.Players, classicPlayer{
		basePlayer: newBasePlayer(username),
	})
	g.playersByUsername[username] = &g.Players[len(g.Players)-1]

	return nil
}

// connectPlayer attaches a websocket connection to a player. If the player
// does not exist, an error is returned. Must be called after addPlayer.
func (g *classic) connectPlayer(username string, con conn) error {
	g.mu.Lock()

	p, ok := g.playersByUsername[username]
	if !ok {
		return errors.New("could not connect player: player with username=" + username + " does not exist")
	}
	p.conn = con
	g.playersByConn[con] = p

	g.mu.Unlock()

	// TODO(ws_err): handle ws error
	_ = con.SendJson("self", p)

	g.broadcastMessage("join", g)

	return nil
}

// handleMessage processes a message from a player. The message is sent to the
// game goroutine for processing. The game goroutine sends a response back to
// the player through the player's channel. Returns an error if the player does
// not exist.
func (g *classic) handleMessage(con conn, message string, body json.RawMessage) error {
	p, ok := g.playersByConn[con]
	if !ok {
		return errors.New("could not handle message: player with connection does not exist")
	}

	m := classicMessage{baseMessage{message, body}, p}

	g.c <- m
	err := <-p.c
	if err != nil {
		// TODO(ws_err): handle msg from game goroutine error
	}

	return nil
}

// broadcastMessage sends a message to all players in the game. If a player's
// connection is nil, the message is not sent to the player. Returns a list of
// potentially nil errors for each connection that failed to send the message.
func (g *classic) broadcastMessage(message string, _ any) {
	g.mu.RLock()
	defer g.mu.RUnlock()

	errs := make([]error, 0, len(g.Players)+len(g.Spectators))
	for _, p := range g.Players {
		if p.conn == nil {
			continue
		}
		// TODO(compact_ws): send compact messages
		err := p.conn.SendJson(message, g)
		errs = append(errs, err)
	}
	for _, s := range g.Spectators {
		if s.conn == nil {
			continue
		}
		// TODO(compact_ws): send compact messages
		err := s.conn.SendJson(message, g)
		errs = append(errs, err)
	}

	// TODO(ws_err): handle broadcast ws error
}

func (g *classic) start() {
	messageFuncs := map[string]map[string]func(classicMessage) error{
		waitingPhase: {
			"ready": g.onMessageReady,
		},
		answerPhase: {
			"answer": g.onMessageAnswer,
		},
	}

	for {
		select {
		case msg := <-g.c:
			if f, ok := messageFuncs[g.Phase.String()][msg.message]; ok {
				if err := f(msg); err != nil {
					// f returns error only if the message is invalid.
					// Websocket errors will already be handled.
					// TODO(ws_err): handle msg from player error
				}
			}
		case phase := <-g.Phase.c:
			switch phase {
			case waitingPhase:
			case previewPhase:
				g.Pedestal = g.Players[rand.Intn(len(g.Players))].Username
				g.broadcastMessage(phase, g.Pedestal)
			case answerPhase:
				if len(g.Word.words) == 0 {
					// TODO(word): handle word pack selection
					// TODO(game_config): make word pack configurable
					g.Word, _ = newWordManager("standard.txt")
					// TODO(word): handle word manager error
				}

				g.broadcastMessage(phase, g.Word.String())
			case revealPhase:
				matches := 0
				pedestal := g.playersByUsername[g.Pedestal]
				for _, player := range g.Players {
					if player.Username == g.Pedestal {
						continue
					}

					if strutil.Similarity(player.Answer, pedestal.Answer, g.metric) > 0.8 {
						player.Score += 10
						matches++
					}
				}
				pedestal.Score += max((matches/(len(g.Players)-1))*10, 5)

				g.broadcastMessage(phase, g.Players)
			}
		}
	}
}

// onMessageReady is the message handler for "ready" during waitingPhase.
func (g *classic) onMessageReady(m classicMessage) error {
	m.p.IsReady = true
	g.broadcastMessage("ready", m)

	for _, p := range g.Players {
		if !p.IsReady {
			return nil
		}
	}
	// TODO(game_config): make phase duration configurable
	go g.Phase.startRound(5 * time.Second)

	return nil
}

// onMessageAnswer is the message handler for "answer" during answerPhase.
func (g *classic) onMessageAnswer(m classicMessage) error {
	var body struct {
		Answer string `json:"answer"`
	}
	if err := json.Unmarshal(m.body, &body); err != nil {
		return err
	}
	m.p.Answer = body.Answer

	return nil
}
