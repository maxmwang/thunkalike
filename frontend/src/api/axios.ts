import axios from 'axios';

import type {
  CreateRequest,
  CreateResponse,
  ErrorResponse,
  JoinRequest,
  JoinResponse,
} from './api';

axios.defaults.withCredentials = true;
axios.defaults.validateStatus = () => true;
axios.defaults.baseURL = '/api';

export type Response<T> = {
  error: boolean;
  status: number;
  response: T | ErrorResponse;
};

async function post(path: string, body: any): Promise<Response<any>> {
  const res = await axios.post(path, body);
  return { error: res.status !== 200, status: res.status, response: res.data };
}

export async function gameCreate(req: CreateRequest): Promise<Response<CreateResponse>> {
  return post('/game/create', req);
}

export async function gameJoin(req: JoinRequest): Promise<Response<JoinResponse>> {
  return post('/game/join', req);
}
