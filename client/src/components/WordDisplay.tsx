import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { on } from '../api/socket';

import '../styles/components/word-display.css';

function WordDisplay() {
  const [word, setWord] = useState('');

  useEffect(() => {
    on('startPhase', () => {
      setWord('');
    });

    on('answerPhase', (w: string) => {
      setWord(w);
    });
  });

  return (
    <div id="word-display" className="paper">
      <Typography variant="h4">
        {word}
      </Typography>
    </div>
  );
}

export default WordDisplay;
