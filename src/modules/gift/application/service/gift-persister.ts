import { Injectable } from '@nestjs/common';

import { GiftRepository } from '~/modules/gift/application/port/out/gift-repository.port';
import { Gift } from '~/modules/gift/domain/model/gift';

@Injectable()
export class GiftPersister {
  constructor(private readonly giftRepository: GiftRepository) {}

  async save(gift: Gift): Promise<void> {
    await this.giftRepository.save(gift);
  }
  async saveAll(gifts: Gift[]): Promise<void> {
    await this.giftRepository.saveAll(gifts);
  }
}
