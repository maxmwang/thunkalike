import { Button, Typography } from '@mui/material';
import React from 'react';

import { startGame } from '../api/socket';

import '../styles/components/start.css';

interface StartProps {
  username: string;
  host: string;
}
function Start({ username, host }: StartProps) {
  if (username === host) {
    return (
      <div id="start">
        <Button variant="contained" onSubmit={startGame}>Start</Button>
      </div>
    );
  }

  return (
    <div id="start">
      <Typography>Waiting for host to start game...</Typography>
    </div>
  );
}

export default Start;
