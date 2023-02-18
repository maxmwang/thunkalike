import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Views from './const';
import Landing from './views/Landing';

function App() {
  const [view, setView] = useState<Views>(Views.LANDING);

  const { code } = useParams();

  const views: { [key in Views]: JSX.Element } = {
    [Views.LANDING]: <Landing setView={setView} code={code} />,
    [Views.GAME]: <div />,
  };

  return (
    <div id="app">
      {views[view]}
    </div>
  );
}

export default App;
