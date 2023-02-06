import type { Socket } from 'socket.io';

import ClassicPlayer from './ClassicPlayer';
import { GamePhases, RoundPhases } from '../const';
import Game from '../Game';

class ClassicGame extends Game {
  private _players: ClassicPlayer[] = [];

  playersReady: Set<string> = new Set();

  private _spectators: ClassicPlayer[] = [];

  /**
   * The player on The Pedestal.
   */
  thePedestal: ClassicPlayer = this.host as ClassicPlayer;

  private thePedestalIndex: number = 0;

  addPlayer(username: string, socket: Socket) {
    for (const player of this._players) {
      if (player.username === username) {
        return;
      }
    }

    const newPlayer = new ClassicPlayer(username, socket, this);
    if (this.gamePhase !== GamePhases.LOBBY) {
      this._spectators.push(newPlayer);
    } else {
      this._players.push(newPlayer);
    }
  }

  removePlayer(username: string): void {
    this._players = this._players.filter((player) => player.username !== username);
    this._spectators = this._spectators.filter((player) => player.username !== username);
  }

  start() {
    if (this.gamePhase === GamePhases.ONGOING) {
      throw new Error('Game has already started.');
    }

    if (this._players.length < 2) {
      throw new Error('Not enough players.');
    }

    super.start();

    // randomize player order
    for (let i = 0; i < this._players.length; i++) {
      const j = Math.floor(Math.random() * this._players.length);
      const temp = this._players[i];
      this._players[i] = this._players[j];
      this._players[j] = temp;
    }

    while ((this.gamePhase as GamePhases) === GamePhases.ONGOING) {
      if (this._players.length === this.playersReady.size) {
        this.previewPhase();

        this.answerPhase();

        this.revealPhase();

        this.roundEnd();
      } else {
        // slow game loop
        setTimeout(() => {}, 1000);
      }
    }
  }

  private previewPhase() {
    this.roundPhase = RoundPhases.PREVIEW_PHASE;

    this.thePedestalIndex = (this.thePedestalIndex + 1) % this._players.length;
    this.thePedestal = this._players[this.thePedestalIndex] as ClassicPlayer;

    this.broadcast(this.roundPhase, this.thePedestal.username);

    setTimeout(() => {}, 5000);
  }

  private answerPhase() {
    this.roundPhase = RoundPhases.ANSWER_PHASE;

    this.updateWord();

    this.broadcast(this.roundPhase, this.word);

    setTimeout(() => {}, 5000);
  }

  private revealPhase() {
    this.roundPhase = RoundPhases.REVEAL_PHASE;

    this.calculateScores();

    const results = this._players.map((player) => player.json());

    this.broadcast(this.roundPhase, results);
  }

  private roundEnd() {
    this.playersReady = new Set();

    this._players.concat(this._spectators);
    this._spectators = [];

    this._players.forEach((player) => {
      player.answer = '';
    });
  }

  private calculateScores() {
    this._players.forEach((player) => {
      if (player !== this.thePedestal && player.answer === this.thePedestal.answer) {
        this.thePedestal.score += 1;
        player.score += 1;
      }
    });
  }

  end() {}
}

export default ClassicGame;
