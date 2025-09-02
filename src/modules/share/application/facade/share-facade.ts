import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { ShareFacade } from '~/modules/share/application/port/in/share-facade.port';
import { SharePersister } from '~/modules/share/application/service/share.persister';
import { ShareReader } from '~/modules/share/application/service/share.reader';
import { Share } from '~/modules/share/domain/model/share';

@Injectable()
export class ShareFacadeImpl extends ShareFacade {
  constructor(
    private readonly shareReader: ShareReader,
    private readonly sharePersister: SharePersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async betShare(userId: string): Promise<void> {
    const share = await this.getOrCreateShare(userId);

    share.betShare();
    await this.sharePersister.save(share);
  }

  @Transactional()
  async gameShare(userId: string): Promise<void> {
    const share = await this.getOrCreateShare(userId);

    share.gameShare();
    await this.sharePersister.save(share);
  }

  async hasBetSharedToday(userId: string): Promise<boolean> {
    const share = await this.shareReader.findByUserId(userId);

    if (!share) {
      return false;
    }

    return share.hasBetSharedToday();
  }

  async hasGameSharedToday(userId: string): Promise<boolean> {
    const share = await this.shareReader.findByUserId(userId);

    if (!share) {
      return false;
    }

    return share.hasGameSharedToday();
  }

  @Transactional()
  private async getOrCreateShare(userId: string): Promise<Share> {
    let share = await this.shareReader.findByUserId(userId);

    if (!share) {
      share = await this.createShare(userId);
    }

    return share;
  }

  private async createShare(userId: string): Promise<Share> {
    const shareId = this.idGenerator.generateId();
    const share = Share.create(shareId, userId);

    await this.sharePersister.save(share);
    return share;
  }
}
