import io from 'socket.io-client';

const socket = io();

export function joinGame(code: string, username: string) {
  socket.emit('joinGame', code, username);
}

export default io();
