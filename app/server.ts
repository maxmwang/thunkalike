import http from 'http';
import * as path from 'path';

import express from 'express';
import { Server } from 'socket.io';

const PORT = Number(process.env.PORT) || 5000;

const app = express();
const server = http.createServer(app);
const io: Server = new Server(server);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('client/dist')));
}

io.on('connection', async (socket) => {
  socket.on('message', (message) => {
    io.emit('message', message);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('client/dist/index.html'));
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
