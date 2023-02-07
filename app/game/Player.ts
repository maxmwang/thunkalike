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
   * The player's latest answer.
   */
  answer: string = '';

  constructor(username: string, socket: Socket) {
    this.username = username;
    this._socket = socket;
  }
}

export default Player;
