import type { Socket } from 'socket.io';

import type ClassicGame from './ClassicGame';
import { RoundPhases } from '../const';
import type Game from '../Game';
import Player from '../Player';

class ClassicPlayer extends Player {
  protected override _game!: ClassicGame;

  /**
   * The Pedestal status.
   */
  isPedestal: boolean = false;

  /**
   * The player's current points.
   */
  score: number = 0;
}

export default ClassicPlayer;
