import type { Socket } from 'socket.io';

import type { GameOptions } from './const';
import { GamePhases, RoundPhases } from './const';
import type Player from './Player';
import wordsFromFile from './util/words';

abstract class Game {
  /**
   * The game code.
   */
  code: string;

  /**
   * The game host.
   */
  host: Player;

  /**
   * The game broadcast function.
   */
  broadcast: (event: string, ...args: any[]) => void;

  /**
   * The Word.
   */
  word: string = '';

  /**
   * The list of unused words.
   */
  private _words: string[] = [];

  /**
   * The current game phase.
   */
  gamePhase: GamePhases = GamePhases.LOBBY;

  /**
   * The round phase.
   */
  roundPhase: RoundPhases = RoundPhases.PREVIEW_PHASE;

  options: GameOptions = { source: 'standard' };

  constructor(code: string, host: Player, io: Socket) {
    this.code = code;
    this.host = host;
    this.broadcast = (event: string, ...args: any[]) => io.to(this.code).emit(event, ...args);
  }

  abstract addPlayer(username: string, socket: Socket): void;

  abstract removePlayer(username: string): void;

  start(): void {
    this.gamePhase = GamePhases.ONGOING;

    this._words = wordsFromFile(this.options.source);
  }

  abstract end(): void;

  protected updateWord() {
    if (this._words.length === 0) {
      this._words = wordsFromFile(this.options.source);
    }
    const index = Math.floor(Math.random() * this._words.length);
    this.word = this._words[index];
    this._words.splice(index, 1);
  }
}

export default Game;
