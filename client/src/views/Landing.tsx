import { Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';

import Create from '../components/Create';
import Join from '../components/Join';
import type Views from '../const';

import '../styles/views/landing.css';

enum LandingTabs {
  CREATE,
  JOIN,
}

interface LandingProps {
  setView: (view: Views) => void;
  code: string | undefined;
}
function Landing({ setView, code }: LandingProps) {
  const [tab, setTab] = useState<LandingTabs>(LandingTabs.CREATE);

  useEffect(() => {
    if (code) {
      setTab(LandingTabs.JOIN);
    }
  }, []);

  return (
    <div id="landing">
      <Tabs value={tab} onChange={(_, n) => setTab(n)}>
        <Tab label="Create" />
        <Tab label="Join" />
      </Tabs>

      {tab === LandingTabs.CREATE ? <Create setView={setView} /> : null}
      {tab === LandingTabs.JOIN ? <Join setView={setView} code={code} /> : null}
    </div>
  );
}

export default Landing;
