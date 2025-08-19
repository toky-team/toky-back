import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { CheerPersister } from '~/modules/cheer/application/service/cheer-persister';
import { CheerPubSubService } from '~/modules/cheer/application/service/cheer-pub-sub.service';
import { CheerReader } from '~/modules/cheer/application/service/cheer-reader';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

@Injectable()
export class CheerFacadeImpl extends CheerFacade {
  constructor(
    private readonly cheerReader: CheerReader,
    private readonly cheerPersister: CheerPersister,
    private readonly cheerPubSubService: CheerPubSubService
  ) {
    super();
  }

  async getCheer(sport: Sport): Promise<CheerPrimitives> {
    const cheer = await this.cheerReader.findBySport(sport);
    if (!cheer) {
      throw new DomainException('CHEER', '응원 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return cheer.toPrimitives();
  }

  @Transactional()
  async addCheer(sport: Sport, university: University, likes: number): Promise<CheerPrimitives> {
    const cheer = await this.cheerReader.findBySport(sport);
    if (!cheer) {
      throw new DomainException('CHEER', '응원 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    cheer.addLikes(university, likes);
    await this.cheerPersister.save(cheer);

    await this.cheerPubSubService.publishCheer(cheer.toPrimitives());

    return cheer.toPrimitives();
  }

  @Transactional()
  async resetCheer(sport: Sport): Promise<CheerPrimitives> {
    const cheer = await this.cheerReader.findBySport(sport);
    if (!cheer) {
      throw new DomainException('CHEER', '응원 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    cheer.reset();
    await this.cheerPersister.save(cheer);

    await this.cheerPubSubService.publishCheer(cheer.toPrimitives());

    return cheer.toPrimitives();
  }
}
