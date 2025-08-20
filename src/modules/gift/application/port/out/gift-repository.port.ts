import { Repository } from '~/libs/core/application-core/repository.interface';
import { Gift } from '~/modules/gift/domain/model/gift';

export abstract class GiftRepository extends Repository<Gift> {}
