import TimerIcon from '@mui/icons-material/Timer';
import { Typography } from '@mui/material';
import React, {
  useEffect,
  useState,
} from 'react';

import '../styles/components/timer.css';

function Timer() {
  const [timeLeft, setTimeLeft] = useState('0');

  useEffect(() => {
    // on('tick', (t: string) => {
    //   setTimeLeft(t);
    // });
    // on('startPhase', () => {
    //   setTimeLeft('0');
    // });
  });

  return (
    <div id="timer">
      <div className="pill">
        <TimerIcon />
        <Typography>{timeLeft}</Typography>
      </div>
    </div>
  );
}

export default Timer;
