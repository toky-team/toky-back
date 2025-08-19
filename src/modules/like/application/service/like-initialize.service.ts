import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { LikeRepository } from '~/modules/like/application/port/out/like-repository.port';
import { Like } from '~/modules/like/domain/model/like';

@Injectable()
export class LikeInitializeService implements OnApplicationBootstrap {
  constructor(private readonly likeRepository: LikeRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.initializeLikes();
  }

  async initializeLikes(): Promise<void> {
    const sports = Object.values(Sport);
    for (const sport of sports) {
      const like = await this.likeRepository.findBySport(sport);
      if (like === null) {
        const newLike = Like.create(sport);
        await this.likeRepository.save(newLike);
      }
    }
  }
}
