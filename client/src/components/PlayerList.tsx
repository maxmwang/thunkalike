import ChairAltIcon from '@mui/icons-material/ChairAlt';
import { Typography } from '@mui/material';
import React from 'react';

import type { GameData } from '../const';
import { GameModes } from '../const';

import '../styles/components/player-list.css';

interface PlayerListProps {
  mode: GameData['mode'];
  username: string;
  players: GameData['players'];
  thePedestal: string | undefined;
}
function PlayerList({
  mode,
  username,
  players,
  thePedestal,
}: PlayerListProps) {
  return (
    <div id="player-list">
      {players.map((player) => (
        <div key={player.username} className="player-listing" style={player.username === username ? { left: '5px', boxShadow: '6px 6px' } : {}}>
          {player.username === thePedestal
            ? <ChairAltIcon className="icon" />
            : <div className="icon" />}

          <Typography className="username" noWrap>
            {player.username}
          </Typography>

          {mode === GameModes.CLASSIC
            ? <Typography>{(player as any).score}</Typography>
            : null}
        </div>
      ))}
    </div>
  );

  // TODO: add spectator list
}

export default PlayerList;
