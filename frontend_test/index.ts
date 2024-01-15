// ide bug?:
import { create } from 'node:domain';

import type { ConsolaInstance } from 'consola';
import { consola } from 'consola';
import fetch from 'node-fetch';
import WebSocket from 'ws';

function newWS(code: string, i: number) {
  const ws = new WebSocket('ws://localhost:5001/game/ws') as WebSocket & { l : ConsolaInstance };
  ws.l = consola.withTag(`[${code} ${i}]`);

  ws.addEventListener('open', () => {
    ws.l.info('Connected');
  });

  ws.addEventListener('close', () => {
    ws.l.info('Closed');
  });

  ws.onmessage = (data) => {
    ws.l.info('Received', data);
  };

  ws.on('message', (data) => {
    ws.l.info('Received', data);
  });

  return ws;
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

  const ws = newWS(code, i);

  return [ws, code];
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

  return newWS(code, i);
}

async function main() {
  const NUM_HOSTS = 1;
  const NUM_PLAYERS = 3;

  for (let i = 0; i < NUM_HOSTS; i++) {
    const [hostWS, code] = await newHost(i);
    const playerWSs = [];

    for (let j = 1; j < NUM_PLAYERS; j++) {
      playerWSs.push(await newPlayer(j, code));
    }
  }
}

if (require.main === module) {
  main();
}
