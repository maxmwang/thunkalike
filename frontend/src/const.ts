export enum GameModes {
  CLASSIC = 'classic',
  DUET = 'duet',
}

export enum GamePhases {
  WAITING = 'waiting',
  PREVIEW = 'preview',
  ANSWER = 'answer',
  REVEAL = 'reveal',
}

type BasePlayer = {
  username: string;
  isReady: boolean;
  answer: string;
};

export type ClassicPlayer = BasePlayer & {
  score: number;
};
export type DuetPlayer = BasePlayer & {};

type BaseGame = {
  code: string;
  mode: string;
  host: string;
  phase: GamePhases;
  word: string;
};

export type ClassicGame = BaseGame & {
  mode: GameModes.CLASSIC;
  players: ClassicPlayer[];
  spectators: ClassicPlayer[];
  pedestal: string;
};
export type DuetGame = BaseGame & {
  players: DuetPlayer[];
  pedestal: '';
};

export type PlayerData = ClassicPlayer | DuetPlayer;
export type GameData = ClassicGame | DuetGame;
