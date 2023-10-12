import { Grid } from '@mui/material';
import React from 'react';

import AnswerInput from './AnswerInput';
import Timer from './Timer';
import WordDisplay from './WordDisplay';

function Board() {
  return (
    <Grid container direction="column">
      <Grid item xs={2}>
        <Timer />
      </Grid>
      <Grid item xs={6}>
        <WordDisplay />
      </Grid>
      <Grid item xs={4}>
        <AnswerInput />
      </Grid>
    </Grid>
  );
}

export default Board;
