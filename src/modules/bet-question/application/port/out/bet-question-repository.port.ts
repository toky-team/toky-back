import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionRepository extends Repository<BetQuestion> {
  abstract findBySport(sport: Sport): Promise<BetQuestion[]>;
}
