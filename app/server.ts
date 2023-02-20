import http from 'http';
import * as path from 'path';

import * as dotenv from 'dotenv';
import express from 'express';
import { Server } from 'socket.io';

import GameManager from './GameManager';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const app = express();
const server = http.createServer(app);
const io: Server = new Server(server);

app.use(express.json());

const gm = new GameManager();
// GameManager middleware
app.use((req, res, next) => {
  req.gm = gm;
  req.io = io;

  next();
});

app.use('/api', require('./routes').default);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('client/dist')));
}

io.on('connection', async (socket) => {
  socket.on('joinGame', (code: string, username: string) => {
    const game = gm.getGame(code);
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }

    if (game.checkName(username)) {
      socket.emit('error', 'Name already taken');
      return;
    }

    game.addPlayer(username, socket);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('client/dist/index.html'));
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
