import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

let socket: Socket;

export function init() {
  if (socket) {
    return;
  }

  socket = io();
}

export function joinGame(code: string, username: string) {
  if (!socket) {
    init();
  }

  socket!.emit('joinGame', code, username);
}

export function startGame() {
  if (!socket) {
    init();
  }

  socket!.emit('startGame');
}

export function endGame() {
  if (!socket) {
    init();
  }

  socket!.emit('endGame');
}

export function on(event: string, callback: (...args: any[]) => void) {
  if (!socket) {
    init();
  }

  socket.off(event, callback);
  socket.on(event, callback);
}
