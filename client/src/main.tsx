import { ThemeProvider, createTheme } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import App from './App';
import './styles/index.css';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#313131',
    },
    secondary: {
      main: '#f5f5f5',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        },
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: ':code',
        element: <App />,
      },
      {
        path: 'howto',
        // element: <HowTo />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={customTheme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
