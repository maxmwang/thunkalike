export enum GamePhases {
  LOBBY,
  ONGOING,
  OVER,
}

export enum RoundPhases {
  START_PHASE = 'startPhase',
  PREVIEW_PHASE = 'previewPhase',
  ANSWER_PHASE = 'answerPhase',
  REVEAL_PHASE = 'revealPhase',
}

export interface GameOptions {
  source: string;
  timer: number;
  answerProximity: number;
}
