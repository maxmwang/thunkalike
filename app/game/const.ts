export enum GamePhases {
  LOBBY,
  ONGOING,
  OVER,
}

export enum RoundPhases {
  PREVIEW_PHASE = 'previewPhase',
  ANSWER_PHASE = 'answerPhase',
  REVEAL_PHASE = 'revealPhase',
}

export interface GameOptions {
  source: string;
}
