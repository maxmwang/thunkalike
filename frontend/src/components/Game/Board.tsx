import { Grid } from '@mui/material';
import React from 'react';

import AnswerInput from './AnswerInput';
import Timer from './Timer';
import WordDisplay from './WordDisplay';
import type { ClassicPlayer, GameData } from '../../const';

type BoardProps = {
  phase: GameData['phase'];
  pedestal: ClassicPlayer | null;
  word: GameData['word'];
};
function Board({ phase, pedestal, word }: BoardProps) {
  return (
    <Grid container direction="column">
      <Grid item xs={2}>
        <Timer phase={phase} />
      </Grid>
      <Grid item xs={6}>
        <WordDisplay phase={phase} word={word} />
      </Grid>
      <Grid item xs={4}>
        <AnswerInput phase={phase} pedestal={pedestal} />
      </Grid>
    </Grid>
  );

  // TODO: show list of players and answers during reveal phase
}

export default Board;
