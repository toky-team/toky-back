import { Injectable } from '@nestjs/common';

import { ShareRepository } from '~/modules/share/application/port/out/share-repository.port';
import { Share } from '~/modules/share/domain/model/share';

@Injectable()
export class ShareReader {
  constructor(private readonly shareRepository: ShareRepository) {}

  async findByUserId(userId: string): Promise<Share | null> {
    return this.shareRepository.findByUserId(userId);
  }
}
