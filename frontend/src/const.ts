export enum GameModes {
  CLASSIC = 'ClassicGame',
  DUET = 'DuetGame',
}

export enum GamePhases {
  LOBBY,
  ONGOING,
  OVER,
}

export enum AppViews {
  LANDING,
  GAME,
}

interface AbstractGameData {
  code: string;
  mode: string;
  phase: GamePhases;
  host: string;
  players: [{ username: string }];
}

export interface ClassicGameData extends AbstractGameData {
  players: [{ username: string, score: number }];
  thePedestal: string;
}

export interface DuetGameData extends AbstractGameData {}

export type GameData = ClassicGameData | DuetGameData;
