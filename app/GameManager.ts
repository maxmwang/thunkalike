import type { Server, Socket } from 'socket.io';

import ClassicGame from './game/classic/ClassicGame';
import ClassicPlayer from './game/classic/ClassicPlayer';
import type Game from './game/Game';

class GameManager {
  /**
   * Map of games by their (unique) code.
   */
  private _games: { [key: string]: Game };

  constructor() {
    this._games = {};
  }

  getGame(code: string) {
    if (!code || !(code.trim().toUpperCase() in this._games)) {
      return undefined;
    }
    return this._games[code.trim().toUpperCase()];
  }

  createClassicGame(io: Server) {
    const code = this.generateUniqueCode();
    this._games[code] = new ClassicGame(code, io, () => this.removeGame(code));
    return code;
  }

  removeGame(code: string) {
    delete this._games[code];
  }

  // generates unique 4-letter game code
  private generateUniqueCode(): string {
    let code = '';
    do {
      code = Math.random().toString(36).substring(2, 6);
    } while (this._games[code]);
    return code.toUpperCase();
  }
}

export default GameManager;
