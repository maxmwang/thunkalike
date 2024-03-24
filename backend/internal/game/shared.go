package game

import (
	"encoding/json"
	"time"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
)

// basePlayer is the base struct of all player types. It contains common
// fields shared by all player types.
type basePlayer struct {
	// Username of the player. Is unique in each game.
	Username string `json:"username"`

	// IsReady is true if the player is ready to start the game rounds.
	IsReady bool `json:"isReady"`

	// Answer is the answer of the player for the current round.
	//
	// Answer similarity is calculated using strutil.Similarity. The
	// similarity threshold can be customized in the game options.
	Answer string `json:"answer"`

	// conn is the websocket connection of the player.
	conn conn

	// c is the channel used to send error response messages to the player.
	// The game goroutine will send an error message through this channel
	// if the player sends an invalid baseMessage, or other related error.
	c chan error
}

// newBasePlayer creates a new basePlayer with the given username, and
// initializes any fields.
func newBasePlayer(username string) basePlayer {
	return basePlayer{
		Username: username,
		c:        make(chan error),
	}
}

// baseMessage is the struct sent from a player's websocket connection
// goroutine to the game goroutine. It represents a player's message from
// the frontend to the game.
type baseMessage struct {
	// message is the type of message received from the player. The message
	// type is used to determine how to handle the message.
	message string

	// body is the raw JSON message body. The body is unmarshalled into a
	// struct based on the message type.
	body json.RawMessage
}

// base is the base struct of all game modes. It contains common fields
// shared by all game modes.
type base struct {
	// Code is the unique code of the game. Code is unique across all game
	// modes.
	Code string `json:"code"`

	// Mode is the game mode of the game. Mode is constant.
	Mode string `json:"mode"`

	// Host is the username of the host player/spectator.
	Host string `json:"host"`

	// Phase is the ticker that ticks every phase duration. Phase marshals
	// into the current phase string. The duration can be changed in the game
	// options.
	Phase phaseTicker `json:"phase"`

	// Word is the word manager that manages the words of the game. Word
	// marshals into the current word string.
	Word wordManager `json:"word"`

	// metric is the similarity metric used to compare player answers.
	metric strutil.StringMetric

	// TODO(game_config): game configuration: metric, string proximity,
	//  word bank
}

// newBase creates a new base with the given code and mode, and initializes
// any fields.
func newBase(code, mode, host string) base {
	return base{
		Code:   code,
		Mode:   mode,
		Host:   host,
		Phase:  newPhaseTicker(),
		metric: metrics.NewHamming(),
	}
}

// conn represents a player's websocket connection. Variables of type conn
// are often named con.
type conn interface {
	SendJson(message string, body any) error
}

const (
	// waitingPhase is the phase where the game is waiting for players to
	// join. The game is in this phase after it is created and between rounds.
	// During this phase, spectators can become players. This phase ends after
	// all players are ready.
	waitingPhase = "waiting"

	// previewPhase is the phase where the game shows the players the word
	// they need to describe. This phase ends after the set duration.
	previewPhase = "preview"

	// answerPhase is the phase where the players send their answers to the
	// game. This phase ends after the set duration.
	answerPhase = "answer"

	// revealPhase is the phase where the game reveals the answers of the
	// players. This phase ends after the set duration.
	revealPhase = "reveal"
)

type phaseTicker struct {
	// phase is the current phase of the game.
	phase string

	// c is the channel between the phase goroutine and the game goroutine.
	// The phase goroutine listens to ticker and outputs the new phase at
	// each tick.
	c chan string

	// ticker is the timer that ticks every phase duration. The duration
	// can be changed in the game options.
	ticker *time.Ticker
}

func newPhaseTicker() phaseTicker {
	return phaseTicker{
		phase:  waitingPhase,
		c:      make(chan string),
		ticker: time.NewTicker(time.Hour), // duration is set in startRound
	}
}

func (pt phaseTicker) startRound(d time.Duration) {
	pt.ticker.Reset(d)
	for i := 0; i < 4; i++ {
		pt.next()
		pt.c <- pt.phase
		<-pt.ticker.C
	}
	pt.ticker.Stop()
}

func (pt phaseTicker) next() {
	switch pt.phase {
	case waitingPhase:
		pt.phase = previewPhase
	case previewPhase:
		pt.phase = answerPhase
	case answerPhase:
		pt.phase = revealPhase
	case revealPhase:
		pt.phase = waitingPhase
	default:
		// TODO: log
		pt.phase = waitingPhase
	}
}

func (pt phaseTicker) MarshalJSON() ([]byte, error) {
	return json.Marshal(pt.phase)
}

func (pt phaseTicker) String() string {
	return pt.phase
}
