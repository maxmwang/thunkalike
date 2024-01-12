package game

const (
	waitingPhase = iota
	previewPhase
	answerPhase
	revealPhase
)

type phase struct {
	now uint8
}

func (p *phase) next() {
	p.now = (p.now + 1) % 4
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
