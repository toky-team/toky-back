import { Repository } from '~/libs/core/application-core/repository.interface';
import { Draw } from '~/modules/draw/domain/model/draw';

export abstract class DrawRepository extends Repository<Draw> {
  abstract findMany(options: DrawFindManyOption): Promise<Draw[]>;
}

interface DrawFindManyOption {
  userId?: string;
  giftId?: string;
}
