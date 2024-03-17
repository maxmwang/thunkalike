import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SocketContext, { Socket } from './api/socket';
import Game from './views/Game';
import Landing from './views/Landing';

enum Views {
  LANDING,
  GAME,
}

function App() {
  const [view, setView] = useState<Views>(Views.LANDING);
  const socket = useMemo(() => new Socket(), []);

  const { urlCode } = useParams();
  const navigate = useNavigate();

  const connect = async (code: string, username: string) => {
    await socket.connect(code, username);
    setView(Views.GAME);
    navigate(`/${code}`);
  };

  const views: { [key in Views]: JSX.Element } = {
    [Views.LANDING]: <Landing connect={connect} urlCode={urlCode} />,
    [Views.GAME]: <Game />,
  };

  return (
    <div id="app">
      <SocketContext.Provider value={socket}>
        {views[view]}
      </SocketContext.Provider>
    </div>
  );
}

export default App;
