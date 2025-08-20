import { Injectable } from '@nestjs/common';

import { GiftRepository } from '~/modules/gift/application/port/out/gift-repository.port';
import { Gift } from '~/modules/gift/domain/model/gift';

@Injectable()
export class GiftReader {
  constructor(private readonly giftRepository: GiftRepository) {}

  async findById(id: string): Promise<Gift | null> {
    return await this.giftRepository.findById(id);
  }

  async findAll(): Promise<Gift[]> {
    return await this.giftRepository.findAll();
  }
}
