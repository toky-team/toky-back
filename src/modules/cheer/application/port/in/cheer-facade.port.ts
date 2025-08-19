import { University } from '~/libs/enums/university';
import { CheerSummaryDto } from '~/modules/cheer/application/dto/cheer-summary.dto';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export abstract class CheerFacade {
  abstract getCheerByUserId(userId: string): Promise<CheerPrimitives>;
  abstract createOrUpdateCheer(userId: string, university: University): Promise<CheerPrimitives>;
  abstract countWithUniversity(): Promise<CheerSummaryDto>;
}
