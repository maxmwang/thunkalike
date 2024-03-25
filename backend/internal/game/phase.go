package game

import (
	"encoding/json"
	"time"
)

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

func newPhaseTicker() *phaseTicker {
	return &phaseTicker{
		phase:  waitingPhase,
		c:      make(chan string),
		ticker: time.NewTicker(time.Hour), // duration is set in startRound
	}
}

func (pt *phaseTicker) startRound(d time.Duration) {
	pt.ticker.Reset(d)
	for i := 0; i < 4; i++ {
		pt.next()
		pt.c <- pt.phase
		<-pt.ticker.C
	}
	pt.ticker.Stop()
}

func (pt *phaseTicker) next() {
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

func (pt *phaseTicker) MarshalJSON() ([]byte, error) {
	return json.Marshal(pt.phase)
}

func (pt *phaseTicker) String() string {
	return pt.phase
}
