import type { Socket } from 'socket.io';

import { RoundPhases } from './const';
import type Game from './Game';

class Player {
  /**
   * The player's unique username.
   */
  username: string;

  /**
   * The player's websocket reference.
   */
  protected _socket: Socket;

  /**
   * The game the player is in.
   */
  protected _game: Game;

  /**
   * The player's latest answer.
   */
  answer: string = '';

  constructor(username: string, socket: Socket, game: Game) {
    this.username = username;
    this._socket = socket;
    this._game = game;

    this._socket.join(this._game.code);
    this._socket.emit('selfJoin', username);

    this._socket.on('ready', () => {
      this._game.readyPlayer(this);
    });

    this._socket.on('startGame', () => {
      if (this._game.host.username === this.username) {
        this._game.start();
      }
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

    this._socket.on('disconnect', () => {
      this._game.removePlayer(this);
    });
  }
}

export default Player;
