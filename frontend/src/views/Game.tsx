import { CircularProgress, Divider, Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import SocketContext from '../api/socket';
import Board from '../components/Game/Board';
import GameInfo from '../components/Game/GameInfo';
import PlayerList from '../components/Game/PlayerList';
import Start from '../components/Game/Start';
import type { GameData, PlayerData } from '../const';
import { GamePhases } from '../const';

import '../styles/views/game.css';

function Game() {
  const [username, setUsername] = useState('');
  const [gameData, setGameData] = useState<GameData>();

  const socket = useContext(SocketContext);

  useEffect(() => {
    const updatePlayerData = (body: PlayerData) => setUsername(body.username);
    const updateGameData = (body: GameData) => setGameData({ ...gameData, ...body });

    socket.on('self', updatePlayerData);

    socket.on('join', updateGameData);
    socket.on('ready', updateGameData);
    socket.on('preview', updateGameData);
    socket.on('answer', updateGameData);
    socket.on('reveal', updateGameData);
  }, []);

  if (!gameData) {
    return (
      <div id="game" className="paper">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div id="game" className="paper">
      <Grid className="game-board" container direction="row">
        <Grid item xs={4}>
          <Grid container direction="column">
            <Grid item xs={2}>
              <GameInfo code={gameData.code} />
            </Grid>

            <Grid item xs>
              <PlayerList
                mode={gameData.mode}
                username={username}
                players={gameData.players}
              />
            </Grid>
          </Grid>
        </Grid>

        <Divider orientation="vertical" />

        <Grid item xs>
          {gameData.phase === GamePhases.WAITING
            ? <Start canReady={gameData.players.length >= 2} />
            : <Board phase={gameData.phase} />}
        </Grid>
      </Grid>
    </div>
  );
}

export default Game;
