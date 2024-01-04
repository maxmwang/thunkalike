package game

type Manager struct {
	games map[string]ConcreteGame
}

func NewManager() *Manager {
	return &Manager{
		games: make(map[string]ConcreteGame),
	}
}

func (gm *Manager) CreateClassic() {
	// create game
}

func (gm *Manager) CreateDuet() {
	//
}

func (gm *Manager) EndGame(code string) {
	//
}

func (gm *Manager) AddPlayer(code, username string) *ConcretePlayer {
	return gm.games[code].AddPlayer(username)
}
