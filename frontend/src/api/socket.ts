import { createContext } from 'react';

import type { PlayerMessage, ServerMessage } from './api';

export class Socket {
  private ws!: WebSocket;

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
  }

  send(message: PlayerMessage) {
    this.ws.send(JSON.stringify(message));
  }

  on(event: string, callback: (...args: any[]) => void) {
    console.log(this);
    if (!(event in this.events)) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  private waitForSocketToOpen(count: number = 0) {
    console.log(count);
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
