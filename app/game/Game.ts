import type { Server, Socket } from 'socket.io';
import stringSim from 'string-similarity';

import type { GameOptions, RoundPhases } from './const';
import { GamePhases } from './const';
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
  host!: Player;

  /**
   * The game broadcast function.
   */
  broadcast: (event: string, ...args: any[]) => void;

  /**
   * The list of players.
   */
  protected abstract _players: Player[];

  /**
   * List of names of players who are ready.
   */
  protected abstract playersReady: Set<string>;

  /**
   * The list of spectators.
   */
  protected abstract _spectators: Player[];

  /**
   * The Word.
   */
  word!: string;

  /**
   * The list of unused words.
   */
  protected _words!: string[];

  /**
   * The current game phase.
   */
  gamePhase: GamePhases = GamePhases.LOBBY;

  /**
   * The round phase.
   */
  roundPhase!: RoundPhases;

  /**
   * Game options.
   */
  options: GameOptions = { source: 'standard' };

  constructor(code: string, io: Server) {
    this.code = code;
    this.broadcast = (event: string, ...args: any[]) => io.to(this.code).emit(event, ...args);
  }

  /**
   * New player class will depend on the game type.
   */
  protected abstract newPlayer(username: string, socket: Socket): Player;

  addPlayer(username: string, socket: Socket, isHost: boolean = false) {
    if (isHost && this.host) {
      return;
    }

    for (const player of this._players) {
      if (player.username === username) {
        return;
      }
    }

    const newPlayer = this.newPlayer(username, socket);
    if (this.gamePhase !== GamePhases.LOBBY) {
      this._spectators.push(newPlayer);
    } else {
      if (isHost) {
        this.host = newPlayer;
      }
      this._players.push(newPlayer);
    }
    this.broadcast('playerJoin', this.json());
  }

  removePlayer(username: string) {
    if (!this._players.some((player) => player.username === username)
      || !this._spectators.some((player) => player.username === username)) {
      return;
    }

    this._players = this._players.filter((player) => player.username !== username);
    this._spectators = this._spectators.filter((player) => player.username !== username);
    this.broadcast('playerLeave', this.json());
  }

  readyPlayer(player: Player) {
    this.playersReady.add(player.username);
  }

  abstract start(): void;

  abstract end(): void;

  protected roundStart() {
    this.playersReady = new Set();

    this._players.forEach((player) => {
      player.answer = '';
    });

    this.broadcast('roundStart', this.json());
  }

  protected updateWord() {
    if (this._words.length === 0) {
      this._words = wordsFromFile(this.options.source);
    }
    const index = Math.floor(Math.random() * this._words.length);
    this.word = this._words[index];
    this._words.splice(index, 1);
  }

  protected loadWords() {
    this._words = wordsFromFile(this.options.source);
  }

  protected answersMatch(w1: string, w2: string) {
    w1 = w1.toLowerCase().trim();
    w2 = w2.toLowerCase().trim();

    // Words are the same if they are 80% similar
    return stringSim.compareTwoStrings(w1, w2) > 0.9;
  }

  /**
   * Returns true if username is taken.
   */
  checkName(username: string) {
    return this._players.some((player) => player.username === username);
  }

  json() {
    return {
      code: this.code,
      host: this.host.username,
      players: this._players.map((player) => ({ username: player.username })),
      spectators: this._spectators.map((player) => ({ username: player.username })),
    };
  }
}

export default Game;
