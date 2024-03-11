import {
  Button,
  Fade,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import capitalize from './form';
import type { CreateResponse, ErrorResponse } from '../../api/api';
import { gameCreate } from '../../api/axios';

type CreateProps = {
  connect: (code: string, username: string) => void;
};
function Create({ connect }: CreateProps) {
  const [form, setForm] = useState({
    username: '',
    usernameError: '',

    mode: 'classic',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username) {
      setForm({ ...form, usernameError: 'Username is required' });
      return;
    }

    setForm({ ...form, usernameError: '' });

    const data = await gameCreate({ username: form.username, mode: form.mode });
    if (data.error) {
      setForm({
        ...form,
        usernameError: capitalize((data.response as ErrorResponse).errors.username),
      });
      return;
    }

    connect((data.response as CreateResponse).code, form.username);
  };

  const handleInput = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [type]: e.target.value, [`${type}Error`]: '' });
  };

  return (
    <Fade in>
      <form className="game-form" onSubmit={handleSubmit}>
        <div className="game-mode">
          <RadioButton
            selected={form.mode === 'classic'}
            setMode={() => setForm({ ...form, mode: 'classic' })}
          >
            <Typography>Classic</Typography>
          </RadioButton>

          <RadioButton
            selected={form.mode === 'duet'}
            setMode={() => setForm({ ...form, mode: 'duet' })}
          >
            <Typography>Duet</Typography>
          </RadioButton>
        </div>

        <TextField
          autoFocus
          variant="standard"
          label="Username"
          value={form.username}
          error={!!form.usernameError}
          helperText={form.usernameError || ' '}
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
