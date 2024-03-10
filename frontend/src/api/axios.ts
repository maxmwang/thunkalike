import axios from 'axios';

import type { CreateResponse, ErrorResponse, JoinResponse } from './api';

axios.defaults.withCredentials = true;
axios.defaults.validateStatus = () => true;
axios.defaults.baseURL = '/api';

type Response<T> = {
  error: boolean;
  response: T | ErrorResponse;
};

export async function gameCreate(
  mode: string,
  username: string,
): Promise<Response<CreateResponse>> {
  const res = await axios.post('/game/create', { mode, username });

  return { error: res.status !== 200, response: res.data };
}

export async function gameJoin(
  code: string,
  username: string,
): Promise<Response<JoinResponse>> {
  const res = await axios.post('/game/join', { code, username });

  return { error: res.status !== 200, response: res.data };
}
