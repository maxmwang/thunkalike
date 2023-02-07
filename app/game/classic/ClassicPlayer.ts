import type { Socket } from 'socket.io';

import type ClassicGame from './ClassicGame';
import { RoundPhases } from '../const';
import Player from '../Player';

class ClassicPlayer extends Player {
  private _game: ClassicGame;

  /**
   * The Pedestal status.
   */
  isPedestal: boolean = false;

  /**
   * The player's current points.
   */
  score: number = 0;

  constructor(username: string, socket: Socket, game: ClassicGame) {
    super(username, socket);

    this._game = game;

    this._socket.on('ready', () => {
      this._game.readyPlayer(this);
    });

    this._socket.on('endGame', () => {
      if (this._game.host.username === this.username) {
        this._game.end();
      }
    });

    this._socket.on('answer', (answer: string) => {
      if (this._game.roundPhase !== RoundPhases.ANSWER_PHASE) {
        return;
      }
      this.answer = answer;
    });
  }
}

export default ClassicPlayer;
