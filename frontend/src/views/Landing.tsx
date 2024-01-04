import { Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';

import Create from '../components/GameForm/Create';
import Join from '../components/GameForm/Join';

import '../styles/views/landing.css';

enum LandingTabs {
  CREATE,
  JOIN,
}

interface LandingProps {
  joinGame(gameCode: string, username: string): void;
  code: string | undefined;
}
function Landing({ joinGame, code }: LandingProps) {
  const [tab, setTab] = useState<LandingTabs>(LandingTabs.CREATE);

  useEffect(() => {
    if (code) {
      setTab(LandingTabs.JOIN);
    }
  }, []);

  return (
    <div id="landing" className="paper">
      <Tabs value={tab} onChange={(_, n) => setTab(n)}>
        <Tab label="Create" />
        <Tab label="Join" />
      </Tabs>

      {tab === LandingTabs.CREATE ? <Create joinGame={joinGame} /> : null}
      {tab === LandingTabs.JOIN ? <Join joinGame={joinGame} code={code} /> : null}
    </div>
  );
}

export default Landing;
