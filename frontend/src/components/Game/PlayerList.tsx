import ChairAltIcon from '@mui/icons-material/ChairAlt';
import { Typography } from '@mui/material';
import React from 'react';

import type { ClassicPlayer, GameData } from '../../const';
import { GameModes } from '../../const';
import '../../styles/components/player-list.css';

interface PlayerListProps {
  mode: GameData['mode'];
  username: string;
  players: GameData['players'];
  pedestal: GameData['pedestal'];
}
function PlayerList({
  mode,
  username,
  players,
  pedestal,
}: PlayerListProps) {
  return (
    <div id="player-list">
      {players.map((player) => (
        <div key={player.username} className="player-listing" style={player.username === username ? { left: '5px', boxShadow: '6px 6px' } : {}}>
          {mode === GameModes.CLASSIC && player.username === pedestal
            ? <ChairAltIcon className="icon" />
            : <div className="icon" />}

          <Typography className="username" noWrap>
            {player.username}
          </Typography>

          {mode === GameModes.CLASSIC
            ? <Typography>{(player as ClassicPlayer).score}</Typography>
            : null /* TODO(duet) */}
        </div>
      ))}
    </div>
  );

  // TODO: add spectator list
  // TODO: show who has answered/readied up
  // TODO: show who is host
  // TODO: make list scrollable when overflowing
}

export default PlayerList;
