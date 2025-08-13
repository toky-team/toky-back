import { Repository } from '~/libs/core/application-core/repository.interface';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionRepository extends Repository<BetQuestion> {
  abstract findBySport(sport: string): Promise<BetQuestion[]>;
}
