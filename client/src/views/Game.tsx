import { CircularProgress, Divider, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { on } from '../api/socket';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import PlayerList from '../components/PlayerList';
import Start from '../components/Start';
import type { GameData } from '../const';
import { GameModes, GamePhases } from '../const';

import '../styles/views/game.css';

function Game() {
  const [username, setUsername] = useState('');
  const [gameData, setGameData] = useState<GameData>();

  useEffect(() => {
    on('selfJoin', (u: string) => {
      setUsername(u);
    });

    on('playerJoin', (data: GameData) => {
      setGameData(data);
    });

    on('playerLeave', (data: GameData) => {
      setGameData(data);
    });

    on('roundStart', (data: GameData) => {
      setGameData(data);
    });
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
                thePedestal={gameData.mode === GameModes.CLASSIC ? gameData.thePedestal : undefined}
              />
            </Grid>
          </Grid>
        </Grid>

        <Divider orientation="vertical" />

        <Grid item xs>
          {true
            ? <Board />
            : <Start username={username} host={gameData.host} />}
        </Grid>
      </Grid>
    </div>
  );
}

export default Game;
