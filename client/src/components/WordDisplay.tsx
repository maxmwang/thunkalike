import React, { useEffect, useState } from 'react';

import { on } from '../api/socket';

function WordDisplay() {
  const [word, setWord] = useState('');

  useEffect(() => {
    on('roundStart', () => {
      setWord('');
    });

    on('answerPhase', (incWord: string) => {
      setWord(incWord);
    });
  });
}

export default WordDisplay;
