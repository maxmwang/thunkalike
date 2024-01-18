import type { ConsolaInstance } from 'consola';
import { Consola, consola } from 'consola';
import fetch from 'node-fetch';
import WebSocket from 'ws';

class WS {
  code: string;

  i: number;

  l: ConsolaInstance;

  ws = new WebSocket('ws://localhost:5001/game/ws');

  constructor(code: string, i: number) {
    this.code = code;
    this.i = i;
    this.l = consola.withTag(`[${code} ${i}]`);

    this.ws.addEventListener('open', () => {
      this.l.info('Connected');
    });

    this.ws.addEventListener('close', () => {
      this.l.info('Closed');
    });

    this.ws.addEventListener('message', (data) => {
      this.l.info('Raw data.data:', data.data);
    });
  }

  static async new(code: string, i: number) {
    const ws = new WS(code, i);

    return new Promise<WS>((resolve) => {
      if (ws.ws.readyState === WebSocket.OPEN) {
        resolve(ws);
      } else {
        ws.ws.addEventListener('open', () => {
          resolve(ws);
        });
      }
    });
  }

  send(message: string, body: any) {
    this.ws.send(JSON.stringify({ message, body }));
  }
}

async function newHost(i: number) {
  const username = `host${i}`;

  const res = await fetch('http://localhost:5001/game/create', {
    method: 'POST',
    body: JSON.stringify({
      username,
      mode: 'classic',
    }),
  });

  if (res.status !== 200) {
    throw new Error(`Failed to join game: ${await res.json()}`);
  }

  const j0 = await res.json();
  const { code } = j0;

  const ws = await WS.new(code, i);
  ws.ws.send(JSON.stringify({ username, code }));

  return { ws, code };
}

async function newPlayer(i: number, code: string) {
  const username = `player${i}`;

  const res = await fetch('http://localhost:5001/game/join', {
    method: 'POST',
    body: JSON.stringify({
      username,
      code,
    }),
  });

  if (res.status !== 200) {
    throw new Error(`Failed to join game: ${await res.json()}`);
  }

  const ws = await WS.new(code, i);
  ws.ws.send(JSON.stringify({ username, code }));

  return ws;
}

async function main() {
  const NUM_HOSTS = 1;
  const NUM_PLAYERS = 3;

  for (let i = 0; i < NUM_HOSTS; i++) {
    const { ws: hostWS, code } = await newHost(i);
    const playerWSs = [];

    for (let j = 1; j < NUM_PLAYERS; j++) {
      playerWSs.push(await newPlayer(j, code));
    }

    hostWS.send('ready', {});
  }
}

if (require.main === module) {
  main();
}
