import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { BetAnswer } from '~/modules/bet-answer/domain/model/bet-answer';

export abstract class BetAnswerRepository extends Repository<BetAnswer> {
  abstract findMany(filter: BetAnswerFindFilter): Promise<BetAnswer[]>;
}

export interface BetAnswerFindFilter {
  userId?: string;
  sport?: Sport;
}
