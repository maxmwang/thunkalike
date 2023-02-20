import type { Socket } from 'socket.io';

import ClassicPlayer from './ClassicPlayer';
import { GamePhases, RoundPhases } from '../const';
import Game from '../Game';

class ClassicGame extends Game {
  protected override _players: ClassicPlayer[] = [];

  protected override playersReady: Set<ClassicPlayer['username']> = new Set();

  protected override _spectators: ClassicPlayer[] = [];

  /**
   * The player on The Pedestal.
   */
  thePedestal!: ClassicPlayer;

  private thePedestalIndex: number = 0;

  protected newPlayer(username: string, socket: Socket) {
    return new ClassicPlayer(username, socket, this);
  }

  start() {
    if (this.gamePhase === GamePhases.ONGOING) {
      throw new Error('Game has already started.');
    }

    if (this._players.length < 2) {
      throw new Error('Not enough players.');
    }

    this.gamePhase = GamePhases.ONGOING;

    // randomize player order
    for (let i = 0; i < this._players.length; i++) {
      const j = Math.floor(Math.random() * this._players.length);
      const temp = this._players[i];
      this._players[i] = this._players[j];
      this._players[j] = temp;
    }

    while ((this.gamePhase as GamePhases) === GamePhases.ONGOING) {
      if (this._players.length === this.playersReady.size) {
        this.roundStart();

        this.previewPhase();

        this.answerPhase();

        this.revealPhase();
      } else {
        // slow game loop
        setTimeout(() => {}, 1000);
      }
    }
  }

  protected override roundStart() {
    // move spectators to players
    this._players.concat(this._spectators);
    this._spectators = [];

    super.roundStart();
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

    // TODO: wait 5 seconds or until all answers are in
    setTimeout(() => {}, 5000);
  }

  private revealPhase() {
    this.roundPhase = RoundPhases.REVEAL_PHASE;

    this.calculateScores();

    const results = this._players.map((player) => ({
      username: player.username,
      score: player.score,
      answer: player.answer,
    }));

    this.broadcast(this.roundPhase, results);
  }

  private calculateScores() {
    let matches = 0;
    this._players.forEach((player) => {
      if (player !== this.thePedestal
          && this.answersMatch(player.answer, this.thePedestal.answer)) {
        matches++;
        player.score += 10;
      }
    });
    this.thePedestal.score += Math.max((matches / (this._players.length - 1)) * 10, 5);
  }

  end() {}

  json() {
    return {
      ...super.json(),
      players: this._players.map((player) => ({ username: player.username, score: player.score })),
      thePedestal: this.thePedestal?.username,
    };
  }
}

export default ClassicGame;
