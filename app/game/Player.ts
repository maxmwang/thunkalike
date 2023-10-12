import type { Socket } from 'socket.io';

import { RoundPhases } from './const';
import type Game from './Game';

abstract class Player {
  /**
   * The player's unique username.
   */
  username: string;

  /**
   * The player's websocket reference.
   */
  protected socket: Socket;

  /**
   * The game the player is in.
   */
  protected game: Game;

  /**
   * The player's latest answer.
   */
  answer: string = '';

  constructor(username: string, socket: Socket, game: Game) {
    this.username = username;
    this.socket = socket;
    this.game = game;

    this.socket.join(this.game.code);
    this.socket.emit('selfJoin', username);

    this.socket.on('ready', () => {
      this.game.readyPlayer(this);
    });

    this.socket.on('startGame', () => {
      if (this.game.host.username === this.username) {
        this.game.start();
      }
    });

    this.socket.on('endGame', () => {
      if (this.game.host.username === this.username) {
        this.game.end();
      }
    });

    this.socket.on('answer', (answer: string) => {
      if (this.game.roundPhase === RoundPhases.ANSWER_PHASE) {
        this.answer = answer.trim().toLowerCase();
      }
    });

    this.socket.on('disconnect', () => {
      this.game.removePlayer(this);
    });
  }

  reset() {
    this.answer = '';
  }

  json() {
    return {
      username: this.username,
      answer: this.game.roundPhase === RoundPhases.REVEAL_PHASE ? this.answer : undefined,
    };
  }
}

export default Player;
