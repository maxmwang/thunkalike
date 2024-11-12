import { Typography } from '@mui/material';
import React from 'react';

import type { GameData } from '../../const';
import { GamePhases } from '../../const';

import '../../styles/components/word-display.css';

type WordDisplayProps = {
  phase: GameData['phase'];
  word: GameData['word'];
};
function WordDisplay({ phase, word }: WordDisplayProps) {
  return (
    <div id="word-display" className="paper">
      <Typography variant="h4">
        {phase === GamePhases.ANSWER || phase === GamePhases.REVEAL ? word : ''}
      </Typography>
    </div>
  );
}

export default WordDisplay;
