import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.validateStatus = () => true;
axios.defaults.baseURL = '/api';

interface CheckNameResponse {
  success?: boolean;
  error?: {
    type: 'invalid' | 'code' | 'username';
    message: string;
  }
}
export async function checkName(code: string, username: string): Promise<CheckNameResponse> {
  const res = await axios.get('/checkName', { params: { code, username } });

  return res.data as CheckNameResponse;
}

interface GameCreateResponse {
  code?: string;
  error?: {
    type: 'username';
    message: string;
  };
}
export async function gameCreate(mode: string, username: string): Promise<GameCreateResponse> {
  const res = await axios.post('/game/create', { mode, username });

  return res.data as GameCreateResponse;
}
