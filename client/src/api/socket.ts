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
  init();

  socket!.emit('joinGame', code, username);
}

export function startGame() {
  init();

  socket!.emit('startGame');
}

export function endGame() {
  init();

  socket!.emit('endGame');
}

export function ready() {
  init();

  socket!.emit('ready');
}

export function submitAnswer(answer: string) {
  init();

  socket!.emit('answer', answer);
}

export function on(event: string, callback: (...args: any[]) => void) {
  init();

  socket.on(event, callback);
}
