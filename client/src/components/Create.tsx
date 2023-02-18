import {
  Button,
  Fade,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { gameCreate } from '../api/axios';
import { joinGame } from '../api/socket';
import Views from '../const';

interface CreateProps {
  setView: (view: Views) => void;
}
function Create({ setView }: CreateProps) {
  const [formData, setFormData] = useState({
    username: '',
    usernameError: '',
    mode: 'classic',
    modeError: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username) {
      setFormData({ ...formData, usernameError: 'Please enter a username' });
      return;
    }

    setFormData({ ...formData, usernameError: '' });

    const data = await gameCreate(formData.username);
    if (data.error) {
      setFormData({ ...formData, usernameError: data.error.message });
      return;
    }

    joinGame(data.code!, formData.username);
    setView(Views.GAME);
  };

  const handleInput = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [type]: e.target.value, [`${type}Error`]: '' });
  };

  return (
    <Fade in>
      <form className="game-form" onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel>Game Mode</FormLabel>
          <RadioGroup
            row
            value={formData.mode}
            onChange={handleInput('mode')}
          >
            <FormControlLabel value="classic" control={<Radio size="small" />} label="Classic" />
            <FormControlLabel value="duet" control={<Radio size="small" />} label="Duet" />
          </RadioGroup>
        </FormControl>

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
          Create
        </Button>
      </form>
    </Fade>
  );
}

export default Create;
