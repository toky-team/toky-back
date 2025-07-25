import { Sport } from '~/libs/enums/sport';
import { EntireScore } from '~/modules/score/application/dto/entire-score.dto';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

export abstract class ScoreFacade {
  abstract startGame(sport: Sport): Promise<ScorePrimitives>;
  abstract endGame(sport: Sport): Promise<ScorePrimitives>;
  abstract updateScore(sport: Sport, kuScore: number, yuScore: number): Promise<ScorePrimitives>;
  abstract resetScore(sport: Sport): Promise<ScorePrimitives>;
  abstract getScore(sport: Sport): Promise<ScorePrimitives>;
  abstract getEntireScore(): Promise<EntireScore>;
}
