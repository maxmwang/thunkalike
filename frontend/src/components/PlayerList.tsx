import ChairAltIcon from '@mui/icons-material/ChairAlt';
import { Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import SocketContext from '../api/socket';
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
  const [thePedestal, setThePedestal] = useState('');

  const { on } = useContext(SocketContext);

  useEffect(() => {
    on('preview', (data: GameData) => {
      if ('pedestal' in data) {
        console.log(data.pedestal);
        setThePedestal(data.pedestal);
      }
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
