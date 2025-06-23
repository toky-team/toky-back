import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { Score } from '~/modules/score/domain/model/score';

export abstract class ScoreRepository extends Repository<Score> {
  abstract findBySport(sport: Sport): Promise<Score | null>;
}
