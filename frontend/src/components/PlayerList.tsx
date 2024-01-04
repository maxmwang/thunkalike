import ChairAltIcon from '@mui/icons-material/ChairAlt';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';

import { on } from '../api/socket';
import type { GameData } from '../const';
import { GameModes } from '../const';
import '../styles/components/player-list.css';

interface PlayerListProps {
  mode: GameData['mode'];
  username: string;
  players: GameData['players'];
}
function PlayerList({
  mode,
  username,
  players,
}: PlayerListProps) {
  const [thePedestal, setThePedestal] = React.useState('');

  useEffect(() => {
    on('previewPhase', (p: string) => {
      console.log(p);
      setThePedestal(p);
    });
  });

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
  // TODO: show who has answered/readied up
  // TODO: show who is host
}

export default PlayerList;
