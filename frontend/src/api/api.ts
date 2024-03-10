export type ErrorResponse = {
  errors: { [key: string] : string }
};

export type CreateRequest = {
  username: string;
  mode: string;
};
export type CreateResponse = {
  code: string;
};

export type JoinRequest = {
  code: string;
  username: string;
};
export type JoinResponse = {};

export type PlayerMessage = {
  code: string;
  message: string;
  body: any;
};
export type ServerMessage = {
  message: string;
  body: any;
};
