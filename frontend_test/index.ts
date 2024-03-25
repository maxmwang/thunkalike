import type { ConsolaInstance } from 'consola';
import { consola } from 'consola';
import fetch from 'node-fetch';
import WebSocket from 'ws';

const apiPrefix = 'http://localhost:5001/api';

class WS {
  code: string;

  i: number;

  username: string;

  l: ConsolaInstance;

  ws = new WebSocket('ws://localhost:5001/ws');

  constructor(code: string, i: number) {
    this.code = code;
    this.i = i;
    this.l = consola.withTag(`[${code} ${i}]`);
    this.username = i === 0 ? `host${i}` : `player${i}`;

    this.ws.addEventListener('open', () => {
      this.l.info('Connected');
    });

    this.ws.addEventListener('close', () => {
      this.l.info('Closed');
    });

    this.ws.addEventListener('message', (data) => {
      this.l.info('Raw data.data:', JSON.stringify(JSON.parse(data.data as string), null, '  '));

      const { message, body } = JSON.parse(data.data as string);
      switch (message) {
        case 'answer': {
          this.ws.send(JSON.stringify({ message: 'answer', code, body: { username: this.username, answer: 'yes' } }));
          break;
        }
        default: {
          this.l.info('Unhandled message:', message);
        }
      }
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

  send(message: string, code: string, body: any) {
    this.ws.send(JSON.stringify({ message, code, body }));
  }
}

async function newHost(i: number) {
  const username = `host${i}`;

  const res = await fetch(`${apiPrefix}/game/create`, {
    method: 'POST',
    body: JSON.stringify({
      username,
      mode: 'classic',
    }),
  });

  if (res.status !== 200) {
    throw new Error(`Failed to join game: ${JSON.stringify(await res.json())}`);
  }

  const j0 = await res.json();
  const { code } = j0;

  const ws = await WS.new(code, i);
  ws.ws.send(JSON.stringify({ username, code }));

  return { ws, code };
}

async function newPlayer(i: number, code: string) {
  const username = `player${i}`;

  const res = await fetch(`${apiPrefix}/game/join`, {
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
    const playerWSs: WS[] = [];

    for (let j = 1; j < NUM_PLAYERS; j++) {
      playerWSs.push(await newPlayer(j, code));
    }

    hostWS.send('ready', code, {});
    playerWSs.forEach((ws) => ws.send('ready', code, {}));
  }
}

if (require.main === module) {
  main()
    .then((r) => console.log('Done:', r));
}
