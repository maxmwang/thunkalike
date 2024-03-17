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
  urlCode: string | undefined;

  connect(code: string, username: string): Promise<void>;
}
function Landing({ connect, urlCode }: LandingProps) {
  const [tab, setTab] = useState<LandingTabs>(LandingTabs.CREATE);

  useEffect(() => {
    if (urlCode) {
      setTab(LandingTabs.JOIN);
    }
  }, []);

  return (
    <div id="landing" className="paper">
      <Tabs value={tab} onChange={(_, n) => setTab(n)}>
        <Tab label="Create" />
        <Tab label="Join" />
      </Tabs>

      {tab === LandingTabs.CREATE ? <Create connect={connect} /> : null}
      {tab === LandingTabs.JOIN ? <Join connect={connect} urlCode={urlCode} /> : null}
    </div>
  );
}

export default Landing;
