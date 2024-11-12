import TimerIcon from '@mui/icons-material/Timer';
import { Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import '../../styles/components/timer.css';
import { GamePhases } from '../../const';

const zero = '0.0';

type TimerProps = {
  phase: string;
};
function Timer({ phase }: TimerProps) {
  const start = useRef(Date.now());
  const [display, setDisplay] = useState(zero);

  useEffect(() => {
    if (phase === GamePhases.PREVIEW
        || phase === GamePhases.ANSWER
        || phase === GamePhases.REVEAL) {
      start.current = Date.now();
      const interval = setInterval(() => {
        const since = (Date.now() - start.current) / 1000;

        // TODO: listen for config changes for phase duration
        if (since > 5) {
          clearInterval(interval);
          setDisplay(zero);
        } else {
          setDisplay((5 - since).toFixed(1).toString());
        }
      }, 100);
    } else {
      setDisplay(zero);
    }
  }, [phase]);

  return (
    <div id="timer">
      <div className="pill">
        <TimerIcon />
        <Typography>{display}</Typography>
      </div>
    </div>
  );
}

export default Timer;
