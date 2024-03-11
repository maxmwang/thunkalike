import { Button, Typography } from '@mui/material';
import React, { useContext } from 'react';

import '../styles/components/start.css';
import SocketContext from '../api/socket';

interface StartProps {
  username: string;
  host: string;
}
function Start({ username, host }: StartProps) {
  const { send } = useContext(SocketContext);

  if (username === host) {
    return (
      <div id="start">
        <Button variant="contained" onClick={() => { send({ code: 'TODO', message: 'TODO', body: {} }); }}>Start</Button>
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
