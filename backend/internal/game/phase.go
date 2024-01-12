package game

import (
	"time"
)

const (
	waitingPhase = iota
	previewPhase
	answerPhase
	revealPhase
)

type phase struct {
	now    uint8
	ticker *time.Ticker

	c chan uint8
}

func (p *phase) next() {
	p.now = (p.now + 1) % 4

	if p.now == previewPhase {
		p.ticker = time.NewTicker(5 * time.Second)
	}
}

func (p *phase) String() string {
	switch p.now {
	case waitingPhase:
		return "waiting"
	case previewPhase:
		return "preview"
	case answerPhase:
		return "answer"
	case revealPhase:
		return "reveal"
	default:
		// TODO: log
		return "unknown"
	}
}
