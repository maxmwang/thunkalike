import type Game from './game/Game';


class GameManager {
  /**
   * Map of games by their (unique) code.
   */
  games: { [key: string]: Game };

  constructor() {
    this.games = {};
  }

  createClassicGame() {

  }

  // generates unique 4-letter game code
  private generateUniqueCode(): string {
    let code = '';
    do {
      code = Math.random().toString(36).substring(2, 6);
    } while (this.games[code]);
    return code;
  }
}

export default GameManager;
