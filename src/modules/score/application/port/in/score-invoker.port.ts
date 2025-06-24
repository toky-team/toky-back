import { Sport } from '~/libs/enums/sport';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

export abstract class ScoreInvoker {
  abstract startGame(sport: Sport): Promise<ScorePrimitives>;
  abstract endGame(sport: Sport): Promise<ScorePrimitives>;
  abstract updateScore(sport: Sport, kuScore: number, yuScore: number): Promise<ScorePrimitives>;
  abstract resetScore(sport: Sport): Promise<ScorePrimitives>;
}
