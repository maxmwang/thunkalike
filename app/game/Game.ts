import type { Server, Socket } from 'socket.io';

import type { GameOptions } from './const';
import { GamePhases, RoundPhases } from './const';
import type Player from './Player';
import TimerManager from './Timer';
import WordManager from './Word';

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
  protected abstract players: Player[];

  /**
   * List of names of players who are ready.
   */
  protected abstract playersReady: Set<string>;

  /**
   * The list of spectators.
   */
  protected abstract spectators: Player[];

  timer: TimerManager;

  wm: WordManager;

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
  options: GameOptions = { source: 'standard', timer: 5000, answerProximity: 0.9 };

  constructor(code: string, io: Server, protected removeGame: (code: string) => void) {
    this.code = code;
    this.broadcast = (event: string, ...args: any[]) => io.to(this.code).emit(event, ...args);
    this.removeGame = removeGame;

    this.timer = new TimerManager((time: string) => {
      this.broadcast('tick', time);
      console.log(time);
    });
    this.wm = new WordManager(this.options.source, this.options.answerProximity);
  }

  /**
   * New player class will depend on the game type.
   */
  protected abstract newPlayer(username: string, socket: Socket): Player;

  /**
   * Adds a player to the game. If the game has already started,
   * the player will be added as a spectator.
   *
   * Will broadcast a `playerJoin` event.
   */
  addPlayer(username: string, socket: Socket) {
    if (this.usernameExists(username)) {
      return;
    }

    const newPlayer = this.newPlayer(username, socket);
    if (this.gamePhase !== GamePhases.LOBBY) {
      this.spectators.push(newPlayer);
    } else {
      if (this.players.length === 0) {
        this.host = newPlayer;
      }
      this.players.push(newPlayer);
    }
    this.broadcast('playerJoin', this.json());
  }

  removePlayer(player: Player) {
    if (!this.playerExists(player)) {
      return;
    }

    this.players = this.players.filter((p) => p !== player);
    this.spectators = this.spectators.filter((p) => p !== player);
    this.broadcast('playerLeave', this.json());

    if (this.players.length === 0 && this.spectators.length === 0) {
      this.removeGame(this.code);
    }
  }

  readyPlayer(player: Player) {
    this.playersReady.add(player.username);

    if (this.allPlayersReady()) {
      this.nextPhase();
    }
  }

  allPlayersReady() {
    return this.playersReady.size === this.players.length;
  }

  unreadyAllPlayers() {
    this.playersReady = new Set();
  }

  /**
   * Returns true if Player is in the game as a player or spectator.
   */
  protected playerExists(player: Player) {
    return this.players.some((p) => p === player) || this.spectators.some((p) => p === player);
  }

  /**
   * Returns true if username is taken.
   */
  usernameExists(username: string) {
    return this.players.some((player) => player.username === username);
  }

  protected roundStart() {
    // could check if all players ready, but this check is copmleted before function is called

    this.roundPhase = RoundPhases.START_PHASE;
    console.log(this.roundPhase);

    this.players.forEach((player) => {
      player.reset();
    });

    this.broadcast(this.roundPhase, this.json());

    // go to next phase
    this.nextPhase();
  }

  // should broadcast 'gameStart' event
  abstract start(): void;

  abstract nextPhase(): void;

  abstract end(): void;

  json() {
    return {
      code: this.code,
      mode: this.constructor.name,
      phase: this.gamePhase,
      host: this.host.username,
      players: this.players.map((player) => player.json()),
      spectators: this.spectators.map((player) => player.json()),
    };
  }
}

export default Game;

// TODO: add timeout to kill games
