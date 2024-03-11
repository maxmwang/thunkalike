import { createContext } from 'react';

import type { PlayerMessage, ServerMessage } from './api';

export class Socket {
  private ws!: WebSocket;

  private events: { [key: string]: ((...args: any[]) => void)[] } = {};

  connect(code: string, username: string) {
    this.ws = new WebSocket('ws://localhost:5001/api/game/ws');

    this.ws.addEventListener('message', (data) => {
      const message: ServerMessage = JSON.parse(data.data as string);
      if (this.events[message.message]) {
        this.events[message.message].forEach((callback) => {
          callback(message.body);
        });
      }
    });
    // TODO: wait for socket to open before sending message
    this.ws.send(JSON.stringify({ code, username }));
  }

  send(message: PlayerMessage) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
}

export default createContext(new Socket());
