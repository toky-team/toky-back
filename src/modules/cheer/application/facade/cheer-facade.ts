import { HttpStatus, Injectable } from '@nestjs/common';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { CheerSummaryDto } from '~/modules/cheer/application/dto/cheer-summary.dto';
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { CheerPersister } from '~/modules/cheer/application/service/cheer-persister';
import { CheerReader } from '~/modules/cheer/application/service/cheer-reader';
import { Cheer, CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

@Injectable()
export class CheerFacadeImpl extends CheerFacade {
  constructor(
    private readonly cheerReader: CheerReader,
    private readonly cheerPersister: CheerPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async getCheerByUserId(userId: string): Promise<CheerPrimitives> {
    const cheer = await this.cheerReader.findByUserId(userId);
    if (!cheer) {
      throw new DomainException('CHEER', '응원 정보를 찾을 수 없습니다.', HttpStatus.BAD_REQUEST);
    }

    return cheer.toPrimitives();
  }

  async createOrUpdateCheer(userId: string, university: University): Promise<CheerPrimitives> {
    let cheer = await this.cheerReader.findByUserId(userId);
    if (!cheer) {
      cheer = Cheer.create(this.idGenerator.generateId(), userId, university);
      await this.cheerPersister.save(cheer);
    } else {
      cheer.changeUniversity(university);
      await this.cheerPersister.save(cheer);
    }

    return cheer.toPrimitives();
  }

  async countWithUniversity(): Promise<CheerSummaryDto> {
    const { [University.KOREA_UNIVERSITY]: KUCheer, [University.YONSEI_UNIVERSITY]: YUCheer } =
      await this.cheerReader.countWithUniversity();
    return {
      KUCheer,
      YUCheer,
    };
  }
}
