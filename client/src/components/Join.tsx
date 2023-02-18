import { Button, Fade, TextField } from '@mui/material';
import React, { useState } from 'react';

import { checkName } from '../api/axios';
import { joinGame } from '../api/socket';
import Views from '../const';

interface JoinProps {
  setView: (view: Views) => void;
  code: string | undefined;
}
function Join({ setView, code }: JoinProps) {
  const [formData, setFormData] = useState({
    code: code || '',
    username: '',
    codeError: '',
    usernameError: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code) {
      setFormData({ ...formData, codeError: 'Please enter a game code' });
      return;
    } if (!formData.username) {
      setFormData({ ...formData, usernameError: 'Please enter a username' });
      return;
    }

    setFormData({ ...formData, codeError: '', usernameError: '' });

    const data = await checkName(formData.code, formData.username);
    if (data.error) {
      switch (data.error.type) {
        case 'code':
          setFormData({ ...formData, codeError: data.error.message });
          break;
        case 'username':
          setFormData({ ...formData, usernameError: data.error.message });
          break;
        default:
          break;
      }
      return;
    }

    joinGame(formData.code, formData.username);
    setView(Views.GAME);
  };

  const handleInput = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [type]: e.target.value, [`${type}Error`]: '' });
  };

  return (
    <Fade in>
      <form className="game-form" onSubmit={handleSubmit}>
        <TextField
          variant="standard"
          label="Game Code"
          value={formData.code}
          error={!!formData.codeError}
          helperText={formData.codeError || ' '}
          onChange={handleInput('code')}
        />

        <TextField
          variant="standard"
          label="Username"
          value={formData.username}
          error={!!formData.usernameError}
          helperText={formData.usernameError || ' '}
          onChange={handleInput('username')}
        />

        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
        >
          Join
        </Button>
      </form>
    </Fade>
  );
}

export default Join;
