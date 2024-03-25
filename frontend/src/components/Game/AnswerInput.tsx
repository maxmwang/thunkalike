import SendIcon from '@mui/icons-material/Send';
import { TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import SocketContext from '../../api/socket';

import '../../styles/components/answer-input.css';

enum Views {
  READY,
  READIED,
  PREVIEW,
  INPUT,
  WAITING,
}

function AnswerInput() {
  const [view, setView] = useState<Views>(Views.READY);
  const [answer, setAnswer] = useState('');

  const socket = useContext(SocketContext);

  const handleReady = () => {
    socket.send({ code: 'TODO', message: 'ready', body: {} });
    setView(Views.READIED);
  };

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer) {
      return;
    }

    socket.send({ code: 'TODO', message: 'answer', body: { answer } });
    setView(Views.WAITING);
  };

  useEffect(() => {
    socket.on('preview', () => {
      setView(Views.PREVIEW);
    });

    socket.on('answer', () => {
      setAnswer('');
      setView(Views.INPUT);
    });
  });

  const views: { [key in Views]: JSX.Element } = {
    [Views.READY]: (
      <div id="answer-ready">
        <button type="button" className="pill pill-button" onClick={handleReady}>
          Ready
        </button>
      </div>
    ),
    [Views.READIED]: (
      <div id="answer-waiting">
        <Typography className="fill" variant="overline">
          Readied
        </Typography>
        <Typography className="fill" variant="overline">
          Waiting for other players...
        </Typography>
      </div>
    ),
    [Views.PREVIEW]: (
      <div id="answer-preview">
        <Typography className="fill" variant="overline">
          Pedestal Assigned
        </Typography>
      </div>
    ),
    [Views.INPUT]: (
      <form id="answer-input" onSubmit={handleAnswer}>
        <TextField
          className="fill"
          autoFocus
          variant="standard"
          label="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button type="submit" className="pill pill-button" onClick={handleAnswer}>
          <SendIcon />
          Submit
        </button>
      </form>
    ),
    [Views.WAITING]: (
      <div id="answer-waiting">
        <Typography className="fill" variant="overline">
          Answered
          {` "${answer}"`}
        </Typography>
        <Typography className="fill" variant="overline">
          Waiting for other players...
        </Typography>
      </div>
    ),
  };

  return views[view];
}

export default AnswerInput;
