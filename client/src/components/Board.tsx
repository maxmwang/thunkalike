import { Grid } from '@mui/material';
import React from 'react';

import Timer from './Timer';

function Board() {
  return (
    <Grid container direction="column">
      <Grid item xs={2}>
        <Timer />
      </Grid>
      <Grid item xs={6}>
        <p>The Word</p>
      </Grid>
      <Grid item xs={4}>
        <p>Answer Input</p>
      </Grid>
    </Grid>
  );
}

export default Board;
