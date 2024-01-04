package game

type classicPlayer struct {
	abstractPlayer
	Score int `json:"score"`
}

type classicGame struct {
	abstractGame
	ThePedestalIndex int `json:"thePedestalIndex"`
}

func (g *classicGame) AddPlayer(username string) *classicPlayer {
	return &classicPlayer{
		abstractPlayer: abstractPlayer{
			Username: username,
			game:     &g.abstractGame,
		},
		Score: 0,
	}
}
