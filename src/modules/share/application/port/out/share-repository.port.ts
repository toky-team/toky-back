import { Repository } from '~/libs/core/application-core/repository.interface';
import { Share } from '~/modules/share/domain/model/share';

export abstract class ShareRepository extends Repository<Share> {
  abstract findByUserId(userId: string): Promise<Share | null>;
}
