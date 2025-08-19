import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { LiveUrlFacade } from '~/modules/live-url/application/port/in/live-url-facade.port';
import { LiveUrlPersister } from '~/modules/live-url/application/service/live-url-persister';
import { LiveUrlReader } from '~/modules/live-url/application/service/live-url-reader';
import { LiveUrl, LiveUrlPrimitives } from '~/modules/live-url/domain/model/live-url';

@Injectable()
export class LiveUrlFacadeImpl extends LiveUrlFacade {
  constructor(
    private readonly liveUrlReader: LiveUrlReader,
    private readonly liveUrlPersister: LiveUrlPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async createLiveUrl(sport: Sport, broadcastName: string, url: string): Promise<LiveUrlPrimitives> {
    const id = this.idGenerator.generateId();
    const newLiveUrl = LiveUrl.create(id, sport, broadcastName, url);
    await this.liveUrlPersister.save(newLiveUrl);
    return newLiveUrl.toPrimitives();
  }

  @Transactional()
  async updateLiveUrl(id: string, broadcastName?: string, url?: string): Promise<LiveUrlPrimitives> {
    const liveUrl = await this.liveUrlReader.findById(id);
    if (!liveUrl) {
      throw new DomainException('LIVE_URL', '라이브 URL을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (broadcastName !== undefined) {
      liveUrl.changeBroadcastName(broadcastName);
    }
    if (url !== undefined) {
      liveUrl.changeUrl(url);
    }
    await this.liveUrlPersister.save(liveUrl);
    return liveUrl.toPrimitives();
  }

  @Transactional()
  async deleteLiveUrl(id: string): Promise<void> {
    const liveUrl = await this.liveUrlReader.findById(id);
    if (!liveUrl) {
      throw new DomainException('LIVE_URL', '라이브 URL을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    liveUrl.delete();
    await this.liveUrlPersister.save(liveUrl);
  }

  async getLiveUrlById(id: string): Promise<LiveUrlPrimitives> {
    const liveUrl = await this.liveUrlReader.findById(id);
    if (!liveUrl) {
      throw new DomainException('LIVE_URL', '라이브 URL을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return liveUrl.toPrimitives();
  }

  async getLiveUrlsBySport(sport: Sport): Promise<LiveUrlPrimitives[]> {
    const liveUrls = await this.liveUrlReader.findBySport(sport);
    return liveUrls.map((liveUrl) => liveUrl.toPrimitives());
  }
}
