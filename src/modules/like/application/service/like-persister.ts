import { Injectable } from '@nestjs/common';

import { LikeRepository } from '~/modules/like/application/port/out/like-repository.port';
import { Like } from '~/modules/like/domain/model/like';

@Injectable()
export class LikePersister {
  constructor(private readonly likeRepository: LikeRepository) {}

  async save(like: Like): Promise<void> {
    await this.likeRepository.save(like);
  }

  async saveAll(likes: Like[]): Promise<void> {
    await this.likeRepository.saveAll(likes);
  }
}
