import type { Socket } from 'socket.io';

import ClassicPlayer from './ClassicPlayer';
import { GamePhases, RoundPhases } from '../const';
import Game from '../Game';

class ClassicGame extends Game {
  protected override players: ClassicPlayer[] = [];

  protected override playersReady: Set<ClassicPlayer['username']> = new Set();

  protected override spectators: ClassicPlayer[] = [];

  /**
   * The player on The Pedestal.
   */
  thePedestal!: ClassicPlayer;

  private _thePedestalIndex: number = 0;

  protected newPlayer(username: string, socket: Socket) {
    return new ClassicPlayer(username, socket, this);
  }

  start() {
    if (this.gamePhase === GamePhases.ONGOING) {
      throw new Error('Game has already started.');
    }

    if (this.players.length < 2) {
      throw new Error('Not enough players.');
      // TODO: send error to client
    }

    this.gamePhase = GamePhases.ONGOING;

    // randomize player order
    for (let i = 0; i < this.players.length; i++) {
      const j = Math.floor(Math.random() * this.players.length);
      const temp = this.players[i];
      this.players[i] = this.players[j];
      this.players[j] = temp;
    }

    this.broadcast('gameStart', this.json());
    // do not go to next phase. next phase starts when last player ready's up.
  }

  nextPhase() {
    switch (this.roundPhase) {
      case RoundPhases.START_PHASE:
        this.previewPhase();
        break;
      case RoundPhases.PREVIEW_PHASE:
        this.answerPhase();
        break;
      case RoundPhases.ANSWER_PHASE:
        this.revealPhase();
        break;
      case RoundPhases.REVEAL_PHASE:
      default:
        this.roundStart();
        break;
    }
  }

  private previewPhase() {
    this.roundPhase = RoundPhases.PREVIEW_PHASE;

    this._thePedestalIndex = (this._thePedestalIndex + 1) % this.players.length;
    this.thePedestal = this.players[this._thePedestalIndex];
    console.log(this.thePedestal.username);

    this.broadcast(this.roundPhase, this.thePedestal.username);

    // go to next phase on timer end
    setTimeout(this.nextPhase.bind(this), this.options.timer);
    this.timer.start(5000);
  }

  private answerPhase() {
    this.roundPhase = RoundPhases.ANSWER_PHASE;
    console.log(this.roundPhase);

    this.wm.updateWord();

    this.broadcast(this.roundPhase, this.wm.word);

    // go to next phase on timer end
    setTimeout(this.nextPhase.bind(this), this.options.timer);
    this.timer.start(5000);
  }

  private revealPhase() {
    this.roundPhase = RoundPhases.REVEAL_PHASE;
    console.log(this.roundPhase);

    this.calculateScores();

    this.broadcast(this.roundPhase, this.json());

    // move spectators to players
    this.players.concat(this.spectators);
    this.spectators = [];

    // do not go to next phase. next phase starts when last player ready's up.
  }

  private calculateScores() {
    let matches = 0;
    this.players.forEach((player) => {
      if (player !== this.thePedestal
          && this.wm.wordsMatch(player.answer, this.thePedestal.answer)) {
        matches++;
        player.score += 10;
      }
    });
    this.thePedestal.score += Math.max((matches / (this.players.length - 1)) * 10, 5);
  }

  end() {}
}

export default ClassicGame;
