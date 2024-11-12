import SendIcon from '@mui/icons-material/Send';
import { TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import SocketContext from '../../api/socket';
import '../../styles/components/answer-input.css';
import type { ClassicPlayer } from '../../const';
import { GamePhases } from '../../const';

enum Views {
  NULL,
  PREVIEW,
  ANSWER,
  ANSWERED,
  REVEAL,
}

type AnswerInputProps = {
  phase: string;
  pedestal: ClassicPlayer | null;
};
function AnswerInput({ phase, pedestal }: AnswerInputProps) {
  const [view, setView] = useState<Views>(Views.NULL);
  const [answer, setAnswer] = useState('');

  const socket = useContext(SocketContext);

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer) {
      return;
    }
    socket.send('answer', { answer });
    setView(Views.ANSWERED);
  };

  useEffect(() => {
    if (phase === GamePhases.PREVIEW) {
      setView(Views.PREVIEW);
    } else if (phase === GamePhases.ANSWER) {
      setAnswer('');
      setView(Views.ANSWER);
    } else if (phase === GamePhases.REVEAL) {
      setView(Views.REVEAL);
    }
  }, [phase]);

  const views: { [key in Views]: JSX.Element } = {
    [Views.NULL]: (
      <div id="answer-null">
        <Typography className="fill" variant="overline">
          Waiting for game to start...
        </Typography>
      </div>
    ),
    [Views.PREVIEW]: (
      <div id="answer-preview">
        {pedestal && (
        <Typography className="fill" variant="overline">
          {`Pedestal Assigned: ${pedestal.username}`}
        </Typography>
        )}
      </div>
    ),
    [Views.ANSWER]: (
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
    [Views.ANSWERED]: (
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
    [Views.REVEAL]: (
      <div id="answer-reveal">
        {pedestal && (
          <Typography className="fill" variant="overline">
            {`Pedestal's Answer: ${pedestal.answer}`}
          </Typography>
        )}
        <Typography className="fill" variant="overline">
          {`Your Answer: ${answer}`}
        </Typography>
      </div>
    ),
  };

  return views[view];
}

export default AnswerInput;
