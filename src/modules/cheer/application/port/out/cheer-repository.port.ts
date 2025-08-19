import { Repository } from '~/libs/core/application-core/repository.interface';
import { Cheer } from '~/modules/cheer/domain/model/cheer';

export abstract class CheerRepository extends Repository<Cheer> {
  abstract findByUserId(userId: string): Promise<Cheer | null>;
}
