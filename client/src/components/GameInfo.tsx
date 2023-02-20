import LinkIcon from '@mui/icons-material/Link';
import { Typography } from '@mui/material';
import React, { useState } from 'react';

import '../styles/components/game-info.css';

interface GameInfoProps {
  code: string;
}
function GameInfo({ code }: GameInfoProps) {
  const [hide, setHide] = useState(false);

  return (
    <div id="game-info">
      <button type="button" className="pill pill-button code" onClick={() => setHide(!hide)}>
        <Typography>{hide ? '✱✱✱✱' : code.toUpperCase()}</Typography>
      </button>

      <button type="button" className="pill pill-button" onClick={() => navigator.clipboard.writeText(window.location.href)}>
        <LinkIcon />
      </button>
    </div>
  );
}

export default GameInfo;
