import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { GamePhases } from '../../const';

import '../../styles/components/word-display.css';

type WordDisplayProps = {
  phase: string;
};
function WordDisplay({ phase }: WordDisplayProps) {
  const [word, setWord] = useState('');

  useEffect(() => {
    if (phase === GamePhases.PREVIEW) {
      setWord('');
    } else if (phase === GamePhases.ANSWER) {
      setWord('');
    }
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
