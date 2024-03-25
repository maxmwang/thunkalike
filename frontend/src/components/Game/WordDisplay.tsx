import { Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import SocketContext from '../../api/socket';
import type { GameData } from '../../const';

import '../../styles/components/word-display.css';

function WordDisplay() {
  const [word, setWord] = useState('');

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on('preview', () => {
      setWord('');
    });

    socket.on('answer', (data: GameData) => {
      setWord(data.word);
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
