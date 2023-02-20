import TimerIcon from '@mui/icons-material/Timer';
import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { on } from '../api/socket';

import '../styles/components/timer.css';

function Timer() {
  const [time, setTime] = useState(5);
  const [interval, setMyInterval] = useState<NodeJS.Timer | null>(null);

  const tick = () => {
    if (time !== 0) {
      setTime(time - 0.1);
    } else if (interval) {
      clearInterval(interval);
    }
  };

  useEffect(() => {
    on('roundStart', () => {
      setTime(5);
    });

    on('previewPhase', () => {
      setTime(5);
      setMyInterval(setInterval(tick, 100));
    });

    on('answerPhase', () => {
      setTime(5);
      setMyInterval(setInterval(tick, 100));
    });
  }, []);

  return (
    <div id="timer">
      <div className="pill">
        <TimerIcon />
        <Typography>{time.toFixed(1)}</Typography>
      </div>
    </div>
  );
}

export default Timer;
