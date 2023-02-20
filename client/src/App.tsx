import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { joinGame as socketJoinGame } from './api/socket';
import { AppViews as Views } from './const';
import Game from './views/Game';
import Landing from './views/Landing';

function App() {
  const [view, setView] = useState<Views>(Views.LANDING);

  const { code } = useParams();
  const navigate = useNavigate();

  const joinGame = (gameCode: string, username: string) => {
    socketJoinGame(gameCode, username);
    setView(Views.GAME);
    navigate(`/${gameCode}`);
  };

  const views: { [key in Views]: JSX.Element } = {
    [Views.LANDING]: <Landing joinGame={joinGame} code={code} />,
    [Views.GAME]: <Game />,
  };

  return (
    <div id="app">
      {views[view]}
    </div>
  );
}

export default App;
