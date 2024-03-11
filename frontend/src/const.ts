export enum GameModes {
  CLASSIC = 'ClassicGame',
  DUET = 'DuetGame',
}

export enum GamePhases {
  WAITING = 'waiting',
  PREVIEW = 'preview',
  ANSWER = 'answer',
  REVEAL = 'reveal',
}

interface AbstractPlayerData {
  username: string;
  isHost: boolean;
  isReady: boolean;
  answer: string;
}
export interface ClassicPlayerData extends AbstractPlayerData {
  score: number;
}
export interface DuetPlayerData extends AbstractPlayerData {}

interface AbstractGameData {
  code: string;
  mode: string;
  word: string;
  host: string;
  phase: GamePhases;
  players: AbstractPlayerData[];
}
export interface ClassicGameData extends AbstractGameData {
  players: ClassicPlayerData[];
  pedestal: string;
}
export interface DuetGameData extends AbstractGameData {}

export type PlayerData = ClassicPlayerData | DuetPlayerData;
export type GameData = ClassicGameData | DuetGameData;
