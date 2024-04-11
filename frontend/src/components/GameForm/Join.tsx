import { Button, Fade, TextField } from '@mui/material';
import React, { useState } from 'react';

import capitalize from './form';
import type { ErrorResponse } from '../../api/api';
import { gameJoin } from '../../api/axios';

type JoinProps = {
  urlCode: string | undefined;

  connect(code: string, username: string): Promise<void>;
};
function Join({ connect, urlCode }: JoinProps) {
  const [form, setForm] = useState({
    code: urlCode?.toUpperCase() || '',
    username: '',

    codeError: '',
    usernameError: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    if (!form.code) {
      setForm({ ...form, codeError: 'Code is required' });
      valid = false;
    } if (!form.username) {
      setForm({ ...form, usernameError: 'Username is required' });
      valid = false;
    }
    if (!valid) return;

    setForm({ ...form, codeError: '', usernameError: '' });

    const data = await gameJoin({ code: form.code, username: form.username });
    if (data.error) {
      setForm({
        ...form,
        codeError: capitalize((data.response as ErrorResponse).errors.code),
        usernameError: capitalize((data.response as ErrorResponse).errors.username),
      });
      return;
    }

    await connect(form.code, form.username);
  };

  const handleInput = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: field === 'code' ? e.target.value.toUpperCase() : e.target.value, [`${field}Error`]: '' });
  };

  return (
    <Fade in>
      <form className="game-form" onSubmit={handleSubmit}>
        <TextField
          autoFocus={urlCode === undefined}
          id="code-input"
          variant="standard"
          label="Game Code"
          value={form.code}
          error={!!form.codeError}
          helperText={form.codeError || ' '}
          onChange={handleInput('code')}
        />

        <TextField
          autoFocus={urlCode !== undefined}
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
          Join
        </Button>
      </form>
    </Fade>
  );
}

export default Join;
