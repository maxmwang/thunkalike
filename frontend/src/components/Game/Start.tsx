import { Button, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';

import '../../styles/components/start.css';
import SocketContext from '../../api/socket';

type StartProps = {
  canReady: boolean;
};
function Start({ canReady }: StartProps) {
  const [isReady, setIsReady] = useState(false);

  const socket = useContext(SocketContext);

  const onReady = () => {
    setIsReady(true);
    socket.send('ready');
  };

  if (!canReady) {
    return (
      <div id="start">
        <Typography className="fill" variant="overline">
          Must have at least 2 players to start.
        </Typography>
      </div>
    );
  }
  if (!isReady) {
    return (
      <div id="start">
        <Button variant="contained" onClick={() => onReady()}>
          Ready
        </Button>
      </div>
    );
  }
  return (
    <div id="start">
      <Typography className="fill" variant="overline">
        Waiting for other players...
      </Typography>
    </div>
  );
}

export default Start;
