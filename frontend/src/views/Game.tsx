import { CircularProgress, Divider, Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import SocketContext from '../api/socket';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import PlayerList from '../components/PlayerList';
import Start from '../components/Start';
import type { GameData, PlayerData } from '../const';
import { GamePhases } from '../const';

import '../styles/views/game.css';

function Game() {
  const [username, setUsername] = useState('');
  const [gameData, setGameData] = useState<GameData>();

  const { on } = useContext(SocketContext);

  useEffect(() => {
    on('self', (body: PlayerData) => {
      setUsername(body.username);
    });

    on('join', (body: GameData) => {
      setGameData({ ...gameData, ...body });
    });

    on('ready', (body: GameData) => {
      setGameData({ ...gameData, ...body });
    });

    on('answer', (body: GameData) => {
      setGameData({ ...gameData, ...body });
    });

    on('reveal', (body: GameData) => {
      setGameData({ ...gameData, ...body });
    });
  });

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
            ? <Start username={username} host={gameData.host} />
            : <Board />}
        </Grid>
      </Grid>
    </div>
  );
}

export default Game;
