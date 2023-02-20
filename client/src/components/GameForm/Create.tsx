import {
  Button,
  Fade,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { gameCreate } from '../../api/axios';

interface CreateProps {
  joinGame: (code: string, username: string) => void;
}
function Create({ joinGame }: CreateProps) {
  const [formData, setFormData] = useState({
    username: '',
    usernameError: '',
    mode: 'classic',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username) {
      setFormData({ ...formData, usernameError: 'Please enter a username' });
      return;
    }

    setFormData({ ...formData, usernameError: '' });

    const data = await gameCreate(formData.mode, formData.username);
    if (data.error) {
      setFormData({ ...formData, usernameError: data.error.message });
      return;
    }

    joinGame(data.code!, formData.username);
  };

  const handleInput = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [type]: e.target.value, [`${type}Error`]: '' });
  };

  return (
    <Fade in>
      <form className="game-form" onSubmit={handleSubmit}>
        <div className="game-mode">
          <RadioButton
            selected={formData.mode === 'classic'}
            setMode={() => setFormData({ ...formData, mode: 'classic' })}
          >
            <Typography>Classic</Typography>
          </RadioButton>

          <RadioButton
            selected={formData.mode === 'duet'}
            setMode={() => setFormData({ ...formData, mode: 'duet' })}
          >
            <Typography>Duet</Typography>
          </RadioButton>
        </div>

        <TextField
          variant="standard"
          label="Username"
          value={formData.username}
          error={!!formData.usernameError}
          helperText={formData.usernameError || ' '}
          onChange={handleInput('username')}
        />

        <Button
          className="button"
          type="submit"
          variant="contained"
          onClick={handleSubmit}
        >
          Create
        </Button>
      </form>
    </Fade>
  );
}

interface RadioButtonProps extends React.PropsWithChildren {
  selected: boolean;
  setMode: () => void;
}
function RadioButton({
  selected, setMode, children,
}: RadioButtonProps) {
  return (
    <button
      type="button"
      className="pill pill-button"
      style={selected ? { boxShadow: '6px 6px' } : {}}
      onClick={setMode}
    >
      {children}
    </button>
  );
}

export default Create;
