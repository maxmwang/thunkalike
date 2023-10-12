import type ClassicGame from './ClassicGame';
import Player from '../Player';

class ClassicPlayer extends Player {
  protected override game!: ClassicGame;

  /**
   * The player's current points.
   */
  score: number = 0;

  json() {
    return {
      ...super.json(),
      score: this.score,
    };
  }
}

export default ClassicPlayer;
