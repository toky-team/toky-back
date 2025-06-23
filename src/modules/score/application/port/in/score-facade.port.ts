import { Sport } from '~/libs/enums/sport';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

export abstract class ScoreFacade {
  abstract startGame(sport: Sport): Promise<void>;
  abstract endGame(sport: Sport): Promise<void>;
  abstract updateScore(sport: Sport, kuScore: number, yuScore: number): Promise<void>;
  abstract resetScore(sport: Sport): Promise<void>;
  abstract getScore(sport: Sport): Promise<ScorePrimitives>;
}
