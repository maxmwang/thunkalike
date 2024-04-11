import { createContext } from 'react';

import type { PlayerMessage, ServerMessage } from './api';

export class Socket {
  private ws!: WebSocket;

  private code!: string;

  private events: { [key: string]: ((...args: any[]) => void)[] } = {};

  async connect(code: string, username: string) {
    // eslint-disable-next-line no-restricted-globals
    this.ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/ws`);

    this.ws.addEventListener('message', (data) => {
      const message: ServerMessage = JSON.parse(data.data as string);
      if (this.events[message.message]) {
        this.events[message.message].forEach((callback) => {
          callback(message.body);
        });
      }
    });
    if (await this.waitForSocketToOpen()) {
      this.ws.send(JSON.stringify({ code, username }));
    } else {
      console.error('Could not connect to the server');
    }
    this.code = code;
  }

  send(message: string, body: any = {}) {
    this.ws.send(JSON.stringify({ code: this.code, message, body } as PlayerMessage));
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!(event in this.events)) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  private waitForSocketToOpen(count: number = 0) {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        if (this.ws.readyState === WebSocket.OPEN) {
          resolve(true);
        } else if (count < 10) {
          this.waitForSocketToOpen(count + 1).then(resolve);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }
}

export default createContext(new Socket());
