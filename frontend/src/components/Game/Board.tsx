import { Grid } from '@mui/material';
import React from 'react';

import AnswerInput from './AnswerInput';
import Timer from './Timer';
import WordDisplay from './WordDisplay';
import type { GamePhases } from '../../const';

type BoardProps = {
  phase: GamePhases;
};
function Board({ phase }: BoardProps) {
  return (
    <Grid container direction="column">
      <Grid item xs={2}>
        <Timer phase={phase} />
      </Grid>
      <Grid item xs={6}>
        <WordDisplay phase={phase} />
      </Grid>
      <Grid item xs={4}>
        <AnswerInput phase={phase} />
      </Grid>
    </Grid>
  );
}

export default Board;
